"""
Farm Impact Scanner Service
Core multi-farm scanning engine for CropClimate AI.

Evaluates all active farms for an authenticated user:
Farm -> Active Crop -> Growth Stage -> Weather/Rainfall -> Soil -> Drainage
     -> Waterlogging -> Damage/Survival/Recovery -> Application Impact Level
     -> Factor Attribution ("Why This Alert") -> Farmer Recommendations (Before/During/After)
     -> Alert Persistence
"""

import logging
from datetime import date, datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.farm import Farm
from app.models.crop import FarmCrop, CropGrowthStage
from app.models.soil import SoilProfile
from app.services.farm_service import geometry_to_geojson
from app.services.soil_provider import soil_provider
from app.services.rain_analysis_service import calculate_rainfall_analysis
from app.services.waterlogging_service import calculate_waterlogging_risk
from app.services.hybrid_impact_engine import hybrid_engine
from app.services.explanation_service import generate_farmer_explanation_statements, format_explanation_payload
from app.services.farmer_action_service import generate_farmer_recommendations
from app.services.weather_warning_service import weather_warning_service
from app.services.alert_service import alert_service

logger = logging.getLogger("farm_impact_scanner")


def determine_application_impact_level(
    waterlogging_risk: str,
    crop_damage_risk: str,
    crop_loss_risk: str,
    growth_stage_vulnerability: str,
    forecast_rain_24h: float,
    drainage_class: str
) -> str:
    """
    Scientifically determines Application Crop Impact Level:
    GREEN   = Low Crop Impact Risk
    YELLOW  = Elevated Crop Impact Risk
    ORANGE  = High Crop Impact Risk
    RED     = Severe Crop Impact Risk

    NEVER uses rainfall alone. Considers waterlogging, stage vulnerability,
    crop damage, and drainage restriction.
    """
    wl = (waterlogging_risk or "").upper()
    dmg = (crop_damage_risk or "").upper()
    loss = (crop_loss_risk or "").upper()
    vuln = (growth_stage_vulnerability or "").upper()
    drain = (drainage_class or "MODERATE").upper()

    # RED - Severe Crop Impact Risk
    if wl in ["CRITICAL", "HIGH"] and (dmg in ["SEVERE", "HIGH"] or vuln in ["HIGH", "CRITICAL"]):
        return "RED"
    if dmg == "SEVERE" or loss == "SEVERE":
        return "RED"
    if forecast_rain_24h > 65.0 and drain in ["POOR", "VERY_POOR"] and vuln in ["HIGH", "CRITICAL"]:
        return "RED"

    # ORANGE - High Crop Impact Risk
    if wl in ["HIGH", "MODERATE"] and dmg in ["HIGH", "SEVERE"]:
        return "ORANGE"
    if dmg == "HIGH" or loss == "HIGH":
        return "ORANGE"
    if forecast_rain_24h > 45.0 and vuln in ["HIGH", "MODERATE"] and drain in ["POOR", "VERY_POOR"]:
        return "ORANGE"
    if wl == "HIGH" and drain in ["POOR", "MODERATE"]:
        return "ORANGE"

    # YELLOW - Elevated Crop Impact Risk
    if wl in ["MODERATE", "ELEVATED"] or dmg == "MODERATE" or loss == "MODERATE":
        return "YELLOW"
    if forecast_rain_24h > 25.0 and (drain in ["POOR", "MODERATE"] or vuln in ["HIGH", "MODERATE"]):
        return "YELLOW"

    # GREEN - Low Crop Impact Risk
    return "GREEN"


def extract_specific_contributing_factors(
    weather_dict: Dict[str, Any],
    soil_dict: Dict[str, Any],
    crop_dict: Dict[str, Any],
    waterlogging_res: Dict[str, Any],
    stage_vuln: str
) -> List[str]:
    """
    Generates factual, evidence-backed contributing factors explaining WHY this farm is at risk.
    Only includes factors that ACTUALLY contributed to the risk.
    """
    factors: List[str] = []

    rain_24h = weather_dict.get("rain_24h", 0.0)
    rain_48h = weather_dict.get("rain_48h", 0.0)
    prev_rain_72h = weather_dict.get("previous_rain_48h", 0.0)  # recent rainfall
    max_intensity = weather_dict.get("max_hourly_rain", 0.0)
    continuous_hrs = weather_dict.get("continuous_rain_hours", 0)
    antecedent_idx = weather_dict.get("antecedent_wetness_index", 0.0)

    # 1. Rain magnitude & intensity
    if rain_24h >= 60.0:
        factors.append(f"Heavy forecast rainfall of {rain_24h:.1f} mm in 24h exceeds field capacity threshold")
    elif rain_24h >= 30.0:
        factors.append(f"Substantial forecast rainfall of {rain_24h:.1f} mm expected over next 24 hours")

    if max_intensity >= 15.0:
        factors.append(f"High peak rainfall intensity reaching {max_intensity:.1f} mm/hr threatens rapid runoff accumulation")

    if continuous_hrs >= 6:
        factors.append(f"Prolonged continuous rainfall spell predicted for {continuous_hrs} consecutive hours")

    # 2. Antecedent wetness & recent rain
    if antecedent_idx >= 25.0 or prev_rain_72h >= 35.0:
        factors.append(f"Pre-existing wet soil conditions from {prev_rain_72h:.1f} mm of rainfall over past 48-72 hours")

    # 3. Soil and drainage factors
    drainage = soil_dict.get("drainage_class", "MODERATE").upper()
    clay_pct = soil_dict.get("clay_percentage", 30.0)
    if drainage in ["POOR", "VERY_POOR"]:
        factors.append("Poor field drainage restricts natural surface runoff discharge")
    if clay_pct >= 40.0:
        factors.append(f"Heavy clay soil texture ({clay_pct:.1f}% clay) impedes downward water infiltration")

    # 4. Waterlogging state
    wl_level = waterlogging_res.get("risk_level", "LOW")
    if wl_level in ["CRITICAL", "HIGH"]:
        factors.append(f"Waterlogging engine flags {wl_level} saturation risk with standing water hazard")

    # 5. Crop growth stage sensitivity
    crop_name = crop_dict.get("crop_name", "Crop")
    stage_name = crop_dict.get("growth_stage", "Active")
    if stage_vuln.upper() in ["HIGH", "CRITICAL"]:
        factors.append(f"{crop_name} at '{stage_name}' stage is highly vulnerable to root anoxia and waterlogging stress")
    elif stage_vuln.upper() == "MODERATE":
        factors.append(f"{crop_name} is in '{stage_name}' stage with moderate submergence sensitivity")

    if not factors:
        factors.append("Normal seasonal moisture levels with adequate soil drainage capacity")

    return factors


def scan_single_farm_impact(db: Session, farm: Farm) -> Dict[str, Any]:
    """
    Performs complete 20-step impact analysis for a single farm.
    Handles farms without crops or missing soil/drainage gracefully.
    """
    # Farm geometry & location
    boundary_geojson = geometry_to_geojson(farm.boundary)
    acres = farm.area_acres or 0.0
    hectares = round(acres * 0.404686, 2)

    # Check verified official weather warning for farm's administrative location
    official_warning = weather_warning_service.get_official_warning_for_location(
        district=farm.district,
        state=farm.state,
        latitude=farm.latitude,
        longitude=farm.longitude
    )

    # Check active crop
    active_crop = (
        db.query(FarmCrop)
        .filter(FarmCrop.farm_id == farm.id, FarmCrop.is_active == True)
        .order_by(desc(FarmCrop.created_at))
        .first()
    )

    if not active_crop:
        logger.info(f"Farm id={farm.id} ({farm.farm_name}) has no active crop profile.")
        return {
            "farm_id": farm.id,
            "farm_name": farm.farm_name,
            "latitude": farm.latitude,
            "longitude": farm.longitude,
            "area_acres": acres,
            "area_hectares": hectares,
            "state": farm.state,
            "district": farm.district,
            "village": farm.village,
            "boundary_geojson": boundary_geojson,
            "has_crop": False,
            "status_message": "Add the crop currently growing on this farm to analyse weather impact.",
            "application_impact_level": "UNKNOWN",
            "official_weather_warning": official_warning,
            "data_completeness": {
                "weather": True,
                "crop": False,
                "growth_stage": False,
                "soil": farm.soil_profile is not None,
                "drainage": farm.drainage_class is not None,
                "post_rain_observation": len(farm.post_rain_assessments) > 0
            }
        }

    # Crop details
    crop_name = active_crop.crop.name if active_crop.crop else "Unknown Crop"
    variety_name = active_crop.variety.variety_name if active_crop.variety else "Standard"
    crop_age_days = (date.today() - active_crop.planting_date).days if active_crop.planting_date else 0

    # Growth stage: USER_CONFIRMED vs ESTIMATED
    if active_crop.user_stage_override:
        growth_stage = active_crop.user_stage_override
        growth_stage_source = "USER_CONFIRMED"
    elif active_crop.current_growth_stage:
        growth_stage = active_crop.current_growth_stage.stage_name
        growth_stage_source = "ESTIMATED"
    else:
        growth_stage = "Vegetative"
        growth_stage_source = "ESTIMATED"

    # Stage vulnerability
    stage_vuln = "MODERATE"
    if active_crop.current_growth_stage:
        stage_vuln = active_crop.current_growth_stage.flood_vulnerability_level or "MODERATE"

    # Soil profile resolution
    existing_soil = db.query(SoilProfile).filter(SoilProfile.farm_id == farm.id).first()
    soil = (
        soil_provider.resolve_soil_provider(farm.id, existing_soil, farm.latitude, farm.longitude, farm.state)
        if hasattr(soil_provider, 'resolve_soil_provider')
        else soil_provider.resolve_soil_profile(farm.id, existing_soil, farm.latitude, farm.longitude, farm.state)
    )
    soil_source = getattr(soil.soil_source, 'value', str(soil.soil_source)) if hasattr(soil, 'soil_source') else "Estimated / Survey"
    drainage_class = farm.drainage_class or "MODERATE"

    # Weather & Rainfall analytics
    try:
        rain_analytics = calculate_rainfall_analysis(farm.latitude, farm.longitude)
        derived = rain_analytics["derived_metrics"]
        raw = rain_analytics["raw_sources"]
        weather_ok = True
    except Exception as e:
        logger.warning(f"Failed to fetch weather for farm {farm.id}: {e}")
        derived = {
            "forecast_rain_24h": 0.0,
            "forecast_rain_48h": 0.0,
            "previous_rain_48h": 0.0,
            "maximum_hourly_rainfall": 0.0,
            "continuous_rain_hours": 0,
            "rain_hours_24h": 0,
            "antecedent_rainfall_index": 0.0
        }
        raw = {"current_temperature": 28.0, "current_humidity": 70.0}
        weather_ok = False

    # Waterlogging Engine
    waterlogging_res = calculate_waterlogging_risk(db, farm)

    # Input payloads for hybrid engine
    farm_dict = {"farm_id": farm.id, "farm_name": farm.farm_name, "latitude": farm.latitude, "longitude": farm.longitude}
    crop_dict = {
        "crop_name": crop_name,
        "variety_name": variety_name,
        "growth_stage": growth_stage,
        "crop_age_days": crop_age_days,
        "season": active_crop.season or "Kharif"
    }
    soil_dict = {
        "soil_type": soil.soil_type or "Clay Loam",
        "sand_percentage": soil.sand_percentage or 30.0,
        "silt_percentage": soil.silt_percentage or 35.0,
        "clay_percentage": soil.clay_percentage or 35.0,
        "drainage_class": drainage_class,
        "soil_moisture_surface": raw.get("current_humidity", 60.0) / 100.0,
        "soil_moisture_rootzone": (raw.get("current_humidity", 60.0) / 100.0) * 1.1,
        "soil_source": soil_source
    }
    weather_dict = {
        "temperature": raw.get("current_temperature", 28.0),
        "humidity": raw.get("current_humidity", 70.0),
        "rain_24h": derived["forecast_rain_24h"],
        "rain_48h": derived["forecast_rain_48h"],
        "previous_rain_48h": derived["previous_rain_48h"],
        "max_hourly_rain": derived["maximum_hourly_rainfall"],
        "continuous_rain_hours": derived["continuous_rain_hours"],
        "rain_hours": derived.get("rain_hours_24h", 4),
        "antecedent_wetness_index": derived["antecedent_rainfall_index"],
        "application_rain_risk": "HIGH_WASH_RISK" if derived["forecast_rain_24h"] > 50.0 else ("MODERATE_WASH_RISK" if derived["forecast_rain_24h"] > 20.0 else "LOW_WASH_RISK"),
        "is_cached": rain_analytics.get("is_cached", False) if weather_ok else False
    }

    # Evaluate Crop Impact via Hybrid Engine
    impact_res = hybrid_engine.evaluate_impact(
        db, farm_dict, crop_dict, soil_dict, weather_dict, waterlogging_res
    )

    # Scientific Application Impact Level
    app_impact_level = determine_application_impact_level(
        waterlogging_risk=waterlogging_res["risk_level"],
        crop_damage_risk=impact_res["crop_damage_risk"],
        crop_loss_risk=impact_res["crop_loss_risk"],
        growth_stage_vulnerability=stage_vuln,
        forecast_rain_24h=derived["forecast_rain_24h"],
        drainage_class=drainage_class
    )

    # Fact-based contributing factors
    contributing_factors = extract_specific_contributing_factors(
        weather_dict, soil_dict, crop_dict, waterlogging_res, stage_vuln
    )

    # Farmer Explanations
    farmer_statements = generate_farmer_explanation_statements(
        weather_dict, soil_dict, crop_dict, waterlogging_res, impact_res
    )
    explanation_payload = format_explanation_payload(impact_res.get("prediction_id", 0), impact_res, farmer_statements)

    # Farmer Recommendations (Before, During, After Rain)
    recommendations = generate_farmer_recommendations(
        db,
        crop_name,
        growth_stage,
        weather_dict["application_rain_risk"],
        waterlogging_res["risk_level"],
        impact_res["crop_damage_risk"],
        drainage_class
    )

    # Persist or update active alert
    alert_record = alert_service.upsert_farm_impact_alert(
        db=db,
        user_id=farm.user_id,
        farm_id=farm.id,
        farm_crop_id=active_crop.id,
        application_impact_level=app_impact_level,
        rain_risk=weather_dict["application_rain_risk"],
        waterlogging_risk=waterlogging_res["risk_level"],
        damage_risk=impact_res["crop_damage_risk"],
        survival_class=impact_res["survival_potential"],
        recovery_class=impact_res["recovery_potential"],
        loss_risk=impact_res["crop_loss_risk"],
        rain_24h=derived["forecast_rain_24h"],
        rain_48h=derived["forecast_rain_48h"],
        previous_rain_72h=derived["previous_rain_48h"],
        main_factors=contributing_factors,
        engine_type=impact_res.get("engine_type", "HYBRID"),
        prediction_id=None
    )

    # Check for recent post-rain assessments
    has_post_rain = len(farm.post_rain_assessments) > 0

    return {
        "farm_id": farm.id,
        "farm_name": farm.farm_name,
        "latitude": farm.latitude,
        "longitude": farm.longitude,
        "area_acres": acres,
        "area_hectares": hectares,
        "state": farm.state,
        "district": farm.district,
        "village": farm.village,
        "boundary_geojson": boundary_geojson,
        "has_crop": True,
        "active_crop": {
            "id": active_crop.id,
            "crop_name": crop_name,
            "variety_name": variety_name,
            "planting_date": active_crop.planting_date.isoformat() if active_crop.planting_date else None,
            "crop_age_days": crop_age_days,
            "growth_stage": growth_stage,
            "growth_stage_source": growth_stage_source,  # USER_CONFIRMED or ESTIMATED
            "stage_vulnerability": stage_vuln
        },
        "soil_profile": {
            "soil_type": soil.soil_type or "Clay Loam",
            "clay_percentage": soil.clay_percentage or 35.0,
            "sand_percentage": soil.sand_percentage or 30.0,
            "drainage_class": drainage_class,
            "soil_source": soil_source
        },
        "weather_metrics": {
            "is_available": weather_ok,
            "temperature_c": raw.get("current_temperature", 28.0),
            "humidity_pct": raw.get("current_humidity", 70.0),
            "forecast_rain_24h_mm": derived["forecast_rain_24h"],
            "forecast_rain_48h_mm": derived["forecast_rain_48h"],
            "previous_rain_48h_mm": derived["previous_rain_48h"],
            "max_hourly_rain_mm": derived["maximum_hourly_rainfall"],
            "continuous_rain_hours": derived["continuous_rain_hours"],
            "antecedent_wetness_index": derived["antecedent_rainfall_index"]
        },
        "waterlogging_analysis": {
            "risk_level": waterlogging_res.get("risk_level", "LOW"),
            "soil_saturation_pct": waterlogging_res.get("soil_saturation_pct", 50.0),
            "estimated_standing_water_hours": waterlogging_res.get("standing_water_hours", 0)
        },
        "crop_impact_analysis": {
            "application_impact_level": app_impact_level,  # GREEN, YELLOW, ORANGE, RED
            "application_rain_risk": weather_dict["application_rain_risk"],
            "damage_risk": impact_res.get("crop_damage_risk", "LOW"),
            "survival_potential": impact_res.get("survival_potential", "HIGH"),  # HIGH, MODERATE, LOW
            "recovery_potential": impact_res.get("recovery_potential", "HIGH"),  # HIGH, MODERATE, LOW
            "crop_loss_risk": impact_res.get("crop_loss_risk", "LOW"),          # LOW, MODERATE, HIGH, SEVERE
            "engine_type": impact_res.get("engine_type", "HYBRID"),
            "model_version": impact_res.get("model_version", "v1.0.0-hybrid")
        },
        "official_weather_warning": official_warning,
        "why_this_alert": {
            "contributing_factors": contributing_factors,
            "farmer_explanation_statements": farmer_statements,
            "technical_feature_importances": explanation_payload.get("technical_feature_importances", {})
        },
        "recommended_actions": {
            "before_rain": recommendations.get("BEFORE_RAIN", []),
            "during_rain": recommendations.get("DURING_RAIN_EVENT", []),
            "after_rain": recommendations.get("AFTER_RAIN", [])
        },
        "data_completeness": {
            "weather": "Verified" if weather_ok else "Unavailable",
            "crop": "Active Profile",
            "growth_stage": growth_stage_source,
            "soil": "Survey" if soil_source != "Default Estimator" else "Estimated",
            "drainage": "Specified" if farm.drainage_class else "Estimated / Default",
            "post_rain_observation": "Submitted" if has_post_rain else "Not Available"
        },
        "alert_id": alert_record.id if alert_record else None
    }


class FarmImpactScanner:
    @staticmethod
    def scan_all_user_farms(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Scans ALL active farms belonging to the authenticated user.
        Generates combined summary and individual farm impacts.
        """
        farms = db.query(Farm).filter(Farm.user_id == user_id).order_by(Farm.created_at.asc()).all()

        if not farms:
            return {
                "has_farms": False,
                "message": "Add your first farm to start crop-impact monitoring.",
                "summary": {
                    "farms_total": 0,
                    "farms_analysed": 0,
                    "farms_requiring_attention": 0,
                    "severe_count": 0,
                    "high_count": 0,
                    "elevated_count": 0,
                    "low_count": 0,
                    "no_crop_count": 0
                },
                "official_weather_warning": weather_warning_service.get_official_warning_for_location(),
                "farms": []
            }

        farm_results = []
        counts = {
            "RED": 0,
            "ORANGE": 0,
            "YELLOW": 0,
            "GREEN": 0,
            "NO_CROP": 0
        }

        # Check official warning from first farm location as regional reference
        ref_farm = farms[0]
        regional_official_warning = weather_warning_service.get_official_warning_for_location(
            district=ref_farm.district,
            state=ref_farm.state,
            latitude=ref_farm.latitude,
            longitude=ref_farm.longitude
        )

        for farm in farms:
            res = scan_single_farm_impact(db, farm)
            farm_results.append(res)

            if not res["has_crop"]:
                counts["NO_CROP"] += 1
            else:
                level = res["crop_impact_analysis"]["application_impact_level"]
                if level in counts:
                    counts[level] += 1

        # Sort farms by priority: RED > ORANGE > YELLOW > GREEN > NO_CROP
        priority_order = {"RED": 0, "ORANGE": 1, "YELLOW": 2, "GREEN": 3, "UNKNOWN": 4}
        farm_results.sort(
            key=lambda x: priority_order.get(
                x.get("crop_impact_analysis", {}).get("application_impact_level", "UNKNOWN"),
                4
            )
        )

        attention_count = counts["RED"] + counts["ORANGE"] + counts["YELLOW"]

        return {
            "has_farms": True,
            "message": "Farm impact analysis complete.",
            "summary": {
                "farms_total": len(farms),
                "farms_analysed": len(farm_results),
                "farms_requiring_attention": attention_count,
                "severe_count": counts["RED"],
                "high_count": counts["ORANGE"],
                "elevated_count": counts["YELLOW"],
                "low_count": counts["GREEN"],
                "no_crop_count": counts["NO_CROP"]
            },
            "official_weather_warning": regional_official_warning,
            "farms": farm_results
        }


farm_impact_scanner = FarmImpactScanner()
