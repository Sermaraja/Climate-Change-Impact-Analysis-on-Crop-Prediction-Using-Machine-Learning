import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.farm import Farm
from app.models.soil import SoilProfile
from app.models.crop import FarmCrop
from app.models.prediction import WaterloggingPrediction
from app.models.enums import RiskLevelEnum
from app.services.soil_provider import soil_provider
from app.services.rain_analysis_service import calculate_rainfall_analysis

DRAINAGE_PENALTY = {
    "POOR": 1.4,
    "MODERATE": 1.0,
    "GOOD": 0.6
}


def calculate_waterlogging_risk(db: Session, farm: Farm) -> Dict[str, Any]:
    """
    Hydrological Waterlogging Risk Engine.
    Combines rainfall analytics, antecedent wetness index (ARI), soil moisture, texture, and drainage class.
    """
    # 1. Fetch Rain Analysis
    try:
        rain_data = calculate_rainfall_analysis(farm.latitude, farm.longitude)
        raw = rain_data["raw_sources"]
        derived = rain_data["derived_metrics"]
    except Exception as e:
        raw = {"current_temperature": 28.0, "current_humidity": 70.0, "current_precipitation": 0.0}
        derived = {
            "forecast_rain_1h": 0.0, "forecast_rain_3h": 0.0, "forecast_rain_6h": 0.0, "forecast_rain_12h": 0.0,
            "forecast_rain_24h": 0.0, "forecast_rain_48h": 0.0, "previous_rain_24h": 0.0, "previous_rain_48h": 0.0,
            "previous_rain_72h": 0.0, "maximum_hourly_rainfall": 0.0, "continuous_rain_hours": 0,
            "antecedent_rainfall_index": 0.0
        }

    # 2. Fetch Soil Profile via Soil Provider Abstraction
    existing_soil = db.query(SoilProfile).filter(SoilProfile.farm_id == farm.id).first()
    soil = soil_provider.resolve_soil_profile(
        farm_id=farm.id,
        existing_profile=existing_soil,
        latitude=farm.latitude,
        longitude=farm.longitude,
        state=farm.state
    )

    # 3. Fetch Active Crop Context
    active_crop = (
        db.query(FarmCrop)
        .filter(FarmCrop.farm_id == farm.id, FarmCrop.is_active == True)
        .order_by(FarmCrop.created_at.desc())
        .first()
    )

    crop_name = active_crop.crop.name if active_crop and active_crop.crop else "Unspecified Crop"
    growth_stage = active_crop.user_stage_override if (active_crop and active_crop.user_stage_override) else ("Vegetative" if not active_crop else "Active Growth")

    # 4. Compute Hydrological Saturation Index
    drainage = farm.drainage_class or "MODERATE"
    drainage_factor = DRAINAGE_PENALTY.get(drainage, 1.0)

    soil_moisture_estimate = raw.get("current_humidity", 60.0) / 100.0  # Approx volumetric moisture ratio
    clay_pct = soil.clay_percentage if soil.clay_percentage is not None else 35.0

    # Saturation index S = (SoilMoisture * 50) + (0.3 * Clay%) + (15 * DrainageFactor)
    saturation_index = round((soil_moisture_estimate * 50.0) + (0.3 * clay_pct) + (15.0 * drainage_factor), 2)

    # 5. Compute Waterlogging Risk Score
    forecast_48h = derived["forecast_rain_48h"]
    ari = derived["antecedent_rainfall_index"]
    continuous_hours = derived["continuous_rain_hours"]
    peak_hourly = derived["maximum_hourly_rainfall"]

    # Risk score W = (0.35 * Forecast48h) + (0.25 * ARI) + (0.25 * SaturationIndex) + (0.15 * ContinuousHours * 4)
    risk_score = round(
        (0.35 * forecast_48h) + (0.25 * ari) + (0.25 * saturation_index) + (0.15 * continuous_hours * 4.0), 2
    )

    # Risk Classification
    if risk_score >= 85.0 or (forecast_48h >= 120.0 and drainage == "POOR") or peak_hourly >= 35.0:
        risk_level = RiskLevelEnum.EXTREME  # Maps to CRITICAL / EXTREME
        display_risk = "CRITICAL"
    elif risk_score >= 60.0 or (forecast_48h >= 70.0 and drainage in ["POOR", "MODERATE"]):
        risk_level = RiskLevelEnum.HIGH
        display_risk = "HIGH"
    elif risk_score >= 35.0 or forecast_48h >= 25.0:
        risk_level = RiskLevelEnum.MODERATE
        display_risk = "MODERATE"
    else:
        risk_level = RiskLevelEnum.LOW
        display_risk = "LOW"

    probability = round(min(0.99, max(0.05, risk_score / 100.0)), 2)

    # Build Contributing Factors List
    contributing_factors: List[str] = []
    if forecast_48h > 40.0:
        contributing_factors.append(f"High 48-Hour Forecast Rain ({forecast_48h} mm)")
    if ari > 50.0:
        contributing_factors.append(f"High Antecedent Rain Index (ARI: {ari})")
    if drainage == "POOR":
        contributing_factors.append("Poor Soil Drainage Class (Waterlogging Prone)")
    if clay_pct >= 40.0:
        contributing_factors.append(f"High Clay Content ({clay_pct}%) Restricting Infiltration")
    if continuous_hours >= 6:
        contributing_factors.append(f"Continuous Rainfall Duration ({continuous_hours} Hours)")

    if not contributing_factors:
        contributing_factors.append("Favorable drainage and low short-term rainfall forecast")

    # Formula Explanation Text
    explanation = f"{' + '.join(contributing_factors[:4])} = {display_risk} WATERLOGGING RISK"

    # 6. Build Input Snapshot
    input_snapshot = {
        "farm_name": farm.farm_name,
        "latitude": farm.latitude,
        "longitude": farm.longitude,
        "crop_name": crop_name,
        "growth_stage": growth_stage,
        "drainage_class": drainage,
        "soil_type": soil.soil_type,
        "soil_source": soil.soil_source,
        "clay_percentage": clay_pct,
        "forecast_rain_24h": derived["forecast_rain_24h"],
        "forecast_rain_48h": forecast_48h,
        "antecedent_rainfall_index": ari,
        "continuous_rain_hours": continuous_hours,
        "maximum_hourly_rainfall": peak_hourly,
        "model_version": "v1.0.0-hydrological"
    }

    # 7. Persist to Database
    db_pred = WaterloggingPrediction(
        farm_id=farm.id,
        waterlogging_probability=probability,
        estimated_stagnation_hours=round(continuous_hours * 1.5, 1) if display_risk in ["HIGH", "CRITICAL"] else 0.0,
        saturation_index=saturation_index,
        risk_level=risk_level,
        input_snapshot_json=json.dumps(input_snapshot),
        model_version="v1.0.0-hydrological"
    )
    db.add(db_pred)
    db.commit()
    db.refresh(db_pred)

    return {
        "prediction_id": db_pred.id,
        "farm_id": farm.id,
        "risk_level": display_risk,
        "risk_level_enum": risk_level.value,
        "waterlogging_probability": probability,
        "saturation_index": saturation_index,
        "contributing_factors": contributing_factors,
        "explanation": explanation,
        "data_sources": [
            "Open-Meteo Satellite & Forecast Weather",
            f"Farm Soil Profile ({soil.soil_source})",
            "PostGIS Farm Boundary & Drainage Class"
        ],
        "input_snapshot": input_snapshot,
        "model_version": "v1.0.0-hydrological",
        "created_at": db_pred.created_at
    }
