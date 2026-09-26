import os
import sys
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

# Add monorepo root to sys.path for joblib module resolution
monorepo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if monorepo_root not in sys.path:
    sys.path.insert(0, monorepo_root)

from app.models.farm import Farm
from app.models.soil import SoilProfile
from app.models.crop import FarmCrop
from app.models.prediction import CropDamagePrediction
from app.models.enums import RiskLevelEnum
from app.services.soil_provider import soil_provider
from app.services.rain_analysis_service import calculate_rainfall_analysis
from app.services.waterlogging_service import calculate_waterlogging_risk


# Singleton Model Loader Container
_MODEL_ARTIFACT_CACHE: Optional[Dict[str, Any]] = None


def get_crop_damage_model_artifact() -> Optional[Dict[str, Any]]:
    """
    Singleton loader for ML Crop Damage model.
    Loads artifact once on startup/first call into memory.
    """
    global _MODEL_ARTIFACT_CACHE
    if _MODEL_ARTIFACT_CACHE is not None:
        return _MODEL_ARTIFACT_CACHE

    artifact_paths = [
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "crop_damage_v1.joblib"),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "damage_class_model.joblib"),
        "ml/models/damage_class_model.joblib",
        "ml/models/crop_damage_v1.joblib"
    ]

    for artifact_path in artifact_paths:
        if os.path.exists(artifact_path):
            try:
                _MODEL_ARTIFACT_CACHE = joblib.load(artifact_path)
                print(f"ML Crop Damage Model loaded into memory singleton from {artifact_path}")
                return _MODEL_ARTIFACT_CACHE
            except Exception as e:
                print(f"Failed to load ML model artifact from {artifact_path}: {e}")

    return None


def run_crop_damage_inference(db: Session, farm: Farm) -> Dict[str, Any]:
    """
    Runs ML Crop Damage Prediction for a farm using active crop, soil profile,
    and real-time weather analytics.
    """
    # 1. Fetch Active Crop Context
    active_crop = (
        db.query(FarmCrop)
        .filter(FarmCrop.farm_id == farm.id, FarmCrop.is_active == True)
        .order_by(FarmCrop.created_at.desc())
        .first()
    )
    if not active_crop:
        raise ValueError("No active crop profile registered for this farm. Assign a crop first.")

    crop_name = active_crop.crop.name if active_crop.crop else "Paddy"
    variety_name = active_crop.variety.variety_name if active_crop.variety else "Default"
    growth_stage = active_crop.user_stage_override or "Vegetative"
    crop_age_days = (active_crop.planting_date).day

    # 2. Fetch Soil & Waterlogging Risk
    existing_soil = db.query(SoilProfile).filter(SoilProfile.farm_id == farm.id).first()
    soil = soil_provider.resolve_soil_provider(farm.id, existing_soil, farm.latitude, farm.longitude, farm.state) if hasattr(soil_provider, 'resolve_soil_provider') else soil_provider.resolve_soil_profile(farm.id, existing_soil, farm.latitude, farm.longitude, farm.state)
    waterlogging_res = calculate_waterlogging_risk(db, farm)
    rain_data = calculate_rainfall_analysis(farm.latitude, farm.longitude)

    derived = rain_data["derived_metrics"]
    raw = rain_data["raw_sources"]

    # 3. Assemble Feature DataFrame
    feature_row = {
        "temperature": float(raw.get("current_temperature", 28.0)),
        "humidity": float(raw.get("current_humidity", 70.0)),
        "rainfall": float(derived.get("forecast_rain_24h", 10.0)),
        "soil_moisture": float(raw.get("current_humidity", 60.0) / 100.0),
        "rain_24h": float(derived["forecast_rain_24h"]),
        "rain_48h": float(derived["forecast_rain_48h"]),
        "previous_rain_48h": float(derived["previous_rain_48h"]),
        "max_hourly_rain": float(derived["maximum_hourly_rainfall"]),
        "continuous_rain_hours": int(derived["continuous_rain_hours"]),
        "rain_hours": int(derived["rain_hours_24h"] if "rain_hours_24h" in derived else 5),
        "antecedent_wetness_index": float(derived["antecedent_rainfall_index"]),
        "crop_age_days": int(crop_age_days),
        "sand_percentage": float(soil.sand_percentage or 30.0),
        "silt_percentage": float(soil.silt_percentage or 35.0),
        "clay_percentage": float(soil.clay_percentage or 35.0),
        "soil_moisture_surface": float(raw.get("current_humidity", 60.0) / 100.0),
        "soil_moisture_rootzone": float((raw.get("current_humidity", 60.0) / 100.0) * 1.1),
        "crop": crop_name,
        "growth_stage": growth_stage,
        "season": active_crop.season or "Kharif",
        "soil_type": soil.soil_type or "Clay Loam",
        "drainage_class": farm.drainage_class or "MODERATE",
        "application_rain_risk": "MODERATE_WASH_RISK" if derived["forecast_rain_24h"] > 20.0 else "LOW_WASH_RISK",
        "waterlogging_risk": waterlogging_res["risk_level"],
        "official_warning_context": "HEAVY_RAINFALL_ADVISORY" if derived["forecast_rain_24h"] > 50.0 else "NO_OFFICIAL_WARNING"
    }

    df_input = pd.DataFrame([feature_row])
    artifact = get_crop_damage_model_artifact()

    if artifact and ("pipeline" in artifact or "model" in artifact):
        pipeline = artifact.get("pipeline")
        if pipeline is not None:
            pred_class = pipeline.predict(df_input)[0]
            damage_class = str(pred_class)

            try:
                probas = pipeline.predict_proba(df_input)[0]
                confidence = round(float(np.max(probas)), 2)
            except Exception:
                confidence = 0.90
        else:
            damage_class = "MODERATE"
            confidence = 0.85

        model_version = artifact.get("model_version", "v1.0.0")
    else:
        # Research / Rule-Based Baseline Fallback
        model_version = "v1.0.0-rule-baseline"
        confidence = 0.85
        if waterlogging_res["risk_level"] == "CRITICAL":
            damage_class = "SEVERE_DAMAGE"
        elif waterlogging_res["risk_level"] == "HIGH":
            damage_class = "MODERATE_DAMAGE"
        elif waterlogging_res["risk_level"] == "MODERATE":
            damage_class = "SLIGHT_DAMAGE"
        else:
            damage_class = "NO_DAMAGE"

    # Normalize damage class strings for API & UI compatibility
    class_loss_map = {
        "NO_DAMAGE": ("NONE", 0.0, 0.95),
        "SLIGHT_DAMAGE": ("MILD", 15.0, 0.80),
        "MODERATE_DAMAGE": ("MODERATE", 35.0, 0.60),
        "SEVERE_DAMAGE": ("SEVERE", 65.0, 0.25),
        "TOTAL_LOSS": ("TOTAL_LOSS", 90.0, 0.05),
        "NONE": ("NONE", 0.0, 0.95),
        "MILD": ("MILD", 15.0, 0.80),
        "MODERATE": ("MODERATE", 35.0, 0.60),
        "SEVERE": ("SEVERE", 65.0, 0.25)
    }

    api_class, estimated_yield_loss_pct, survival_probability = class_loss_map.get(damage_class, ("MODERATE", 35.0, 0.60))

    # Risk Enum Mapping for Database
    risk_enum_map = {
        "NONE": RiskLevelEnum.LOW,
        "MILD": RiskLevelEnum.LOW,
        "MODERATE": RiskLevelEnum.MODERATE,
        "SEVERE": RiskLevelEnum.HIGH,
        "TOTAL_LOSS": RiskLevelEnum.EXTREME
    }
    db_risk_enum = risk_enum_map.get(api_class, RiskLevelEnum.MODERATE)

    main_input_factors = [
        f"Active Crop: {crop_name} ({growth_stage} Stage)",
        f"Soil Drainage: {farm.drainage_class or 'MODERATE'} ({soil.soil_type})",
        f"Waterlogging Risk Level: {waterlogging_res['risk_level']}",
        f"Forecast 48h Accumulation: {derived['forecast_rain_48h']} mm",
        f"Antecedent Rain Index (ARI): {derived['antecedent_rainfall_index']}"
    ]

    # 4. Persist to Database
    db_pred = CropDamagePrediction(
        farm_id=farm.id,
        farm_crop_id=active_crop.id,
        waterlogging_pred_id=waterlogging_res["prediction_id"],
        damage_risk_level=db_risk_enum,
        estimated_yield_loss_pct=estimated_yield_loss_pct,
        survival_probability=survival_probability,
        model_version=model_version
    )
    db.add(db_pred)
    db.commit()
    db.refresh(db_pred)

    return {
        "prediction_id": db_pred.id,
        "farm_id": farm.id,
        "farm_crop_id": active_crop.id,
        "crop_name": crop_name,
        "damage_class": api_class,
        "survival_probability": survival_probability,
        "estimated_yield_loss_pct": estimated_yield_loss_pct,
        "confidence_score": confidence,
        "model_version": model_version,
        "main_input_factors": main_input_factors,
        "created_at": db_pred.created_at
    }
