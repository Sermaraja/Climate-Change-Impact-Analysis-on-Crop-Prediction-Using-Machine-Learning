"""
Stage 14 — Master "Analyse My Crop" End-to-End Orchestrator Service
Executes full 20-step pipeline: Farm -> Crop -> Weather -> Waterlogging -> Hybrid Impact Engine -> Explanation -> Action Recommendations -> Persistence.
"""

from datetime import date, datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.models.farm import Farm
from app.models.crop import FarmCrop
from app.models.soil import SoilProfile
from app.models.prediction import CropDamagePrediction, CropRecoveryPrediction, Recommendation, PredictionExplanation
from app.models.enums import RiskLevelEnum, RecommendationTimingEnum
from app.services.soil_provider import soil_provider
from app.services.rain_analysis_service import calculate_rainfall_analysis
from app.services.waterlogging_service import calculate_waterlogging_risk
from app.services.hybrid_impact_engine import hybrid_engine
from app.services.explanation_service import generate_farmer_explanation_statements, format_explanation_payload
from app.services.farmer_action_service import generate_farmer_recommendations


def run_full_analyse_my_crop_pipeline(db: Session, farm: Farm) -> Dict[str, Any]:
    # 1. Load Active Crop Profile & calculate crop age
    active_crop = (
        db.query(FarmCrop)
        .filter(FarmCrop.farm_id == farm.id, FarmCrop.is_active == True)
        .order_by(FarmCrop.created_at.desc())
        .first()
    )
    if not active_crop:
        raise ValueError("No active crop profile registered for this farm. Assign a crop first.")

    crop_name = active_crop.crop.name if active_crop.crop else "Paddy"
    variety_name = active_crop.variety.variety_name if active_crop.variety else "Standard"
    growth_stage = active_crop.user_stage_override or "Vegetative"
    crop_age_days = (date.today() - active_crop.planting_date).days

    # 2. Load Soil Profile & Drainage Class
    existing_soil = db.query(SoilProfile).filter(SoilProfile.farm_id == farm.id).first()
    soil = soil_provider.resolve_soil_provider(farm.id, existing_soil, farm.latitude, farm.longitude, farm.state) if hasattr(soil_provider, 'resolve_soil_provider') else soil_provider.resolve_soil_profile(farm.id, existing_soil, farm.latitude, farm.longitude, farm.state)
    drainage_class = farm.drainage_class or "MODERATE"

    # 3. Fetch/Update Weather & Rain Analytics
    rain_analytics = calculate_rainfall_analysis(farm.latitude, farm.longitude)
    derived = rain_analytics["derived_metrics"]
    raw = rain_analytics["raw_sources"]

    # 4. Waterlogging Risk Engine
    waterlogging_res = calculate_waterlogging_risk(db, farm)

    # 5. Assemble Structured Input Dictionaries
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
        "soil_source": soil.soil_source.value if hasattr(soil.soil_source, 'value') else str(soil.soil_source)
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
        "official_warning_context": "HEAVY_RAINFALL_ADVISORY" if derived["forecast_rain_24h"] > 50.0 else "NO_OFFICIAL_WARNING",
        "is_cached": rain_analytics.get("is_cached", False)
    }

    # 6. Run Stage 12 Hybrid Crop Impact Engine
    impact_res = hybrid_engine.evaluate_impact(
        db, farm_dict, crop_dict, soil_dict, weather_dict, waterlogging_res
    )

    # 7. Generate Stage 13 Explanation
    farmer_statements = generate_farmer_explanation_statements(
        weather_dict, soil_dict, crop_dict, waterlogging_res, impact_res
    )

    # 8. Generate Stage 15 Action Recommendations
    action_recommendations = generate_farmer_recommendations(
        db,
        crop_name,
        growth_stage,
        weather_dict["application_rain_risk"],
        waterlogging_res["risk_level"],
        impact_res["crop_damage_risk"],
        drainage_class
    )

    # 9. Persist Prediction & Explanation Snapshots to Database
    risk_enum_map = {
        "LOW": RiskLevelEnum.LOW,
        "MODERATE": RiskLevelEnum.MODERATE,
        "HIGH": RiskLevelEnum.HIGH,
        "SEVERE": RiskLevelEnum.EXTREME
    }
    db_risk_enum = risk_enum_map.get(impact_res["crop_damage_risk"], RiskLevelEnum.MODERATE)

    # Damage prediction record
    db_damage_pred = CropDamagePrediction(
        farm_id=farm.id,
        farm_crop_id=active_crop.id,
        waterlogging_pred_id=waterlogging_res["prediction_id"],
        damage_risk_level=db_risk_enum,
        estimated_yield_loss_pct=35.0 if impact_res["crop_damage_risk"] == "MODERATE" else (65.0 if impact_res["crop_damage_risk"] in ["HIGH", "SEVERE"] else 10.0),
        survival_probability=0.85 if impact_res["survival_potential"] == "HIGH" else (0.50 if impact_res["survival_potential"] == "MEDIUM" else 0.20),
        model_version=impact_res.get("model_version") or "v1.0.0-hybrid"
    )
    db.add(db_damage_pred)
    db.commit()
    db.refresh(db_damage_pred)

    # Recovery prediction record
    db_rec_pred = CropRecoveryPrediction(
        farm_id=farm.id,
        damage_pred_id=db_damage_pred.id,
        recovery_likelihood=0.85 if impact_res["recovery_potential"] == "HIGH" else (0.55 if impact_res["recovery_potential"] == "MEDIUM" else 0.25),
        post_drain_recovery_days=3 if impact_res["recovery_potential"] == "HIGH" else 7,
        key_factors="; ".join(farmer_statements[:3]),
        model_version="v1.0.0-tnau-rules"
    )
    db.add(db_rec_pred)
    db.commit()

    # Explanation record
    explanation_payload = format_explanation_payload(db_damage_pred.id, impact_res, farmer_statements)
    db_explanation = PredictionExplanation(
        damage_pred_id=db_damage_pred.id,
        explanation_text="\n".join(farmer_statements),
        feature_importance_json=str(explanation_payload["technical_feature_importances"])
    )
    db.add(db_explanation)
    db.commit()

    # 10. Return Unified Response Schema (Stage 14 Output)
    return {
        "analysis_id": db_damage_pred.id,
        "timestamp": db_damage_pred.created_at.isoformat() if hasattr(db_damage_pred.created_at, 'isoformat') else str(db_damage_pred.created_at),
        "farm_header": {
            "farm_id": farm.id,
            "farm_name": farm.farm_name,
            "crop_name": crop_name,
            "variety_name": variety_name,
            "crop_age_days": crop_age_days,
            "growth_stage": growth_stage,
            "soil_type": soil.soil_type,
            "drainage_class": drainage_class
        },
        "weather_summary": {
            "current_temperature_c": raw.get("current_temperature", 28.0),
            "current_humidity_pct": raw.get("current_humidity", 70.0),
            "forecast_rain_24h_mm": derived["forecast_rain_24h"],
            "forecast_rain_48h_mm": derived["forecast_rain_48h"],
            "previous_rain_48h_mm": derived["previous_rain_48h"],
            "antecedent_wetness_index": derived["antecedent_rainfall_index"]
        },
        "primary_results": {
            "application_rain_risk": weather_dict["application_rain_risk"],
            "waterlogging_risk": waterlogging_res["risk_level"],
            "crop_damage_risk": impact_res["crop_damage_risk"],
            "survival_potential": impact_res["survival_potential"],
            "recovery_potential": impact_res["recovery_potential"],
            "crop_loss_risk": impact_res["crop_loss_risk"]
        },
        "why_this_result": explanation_payload,
        "action_recommendations": action_recommendations,
        "analysis_metadata": {
            "engine_type": impact_res["engine_type"],
            "model_version": impact_res.get("model_version"),
            "rule_version": impact_res.get("rule_version"),
            "data_quality_flags": impact_res.get("data_quality_flags", []),
            "sources": ["Open-Meteo Weather API", "SoilGrids / Farm Survey", "TNAU Submergence Manual", "ICAR Abiotic Stress Guide"]
        }
    }
