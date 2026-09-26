import os
import sys
import joblib
import numpy as np
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

# Add monorepo root to sys.path for joblib module resolution of ml.src
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

    artifact_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "crop_damage_v1.joblib")
    if not os.path.exists(artifact_path):
        # Fallback path if running from root
        artifact_path = "ml/models/crop_damage_v1.joblib"

    if os.path.exists(artifact_path):
        try:
            _MODEL_ARTIFACT_CACHE = joblib.load(artifact_path)
            print(f"ML Crop Damage Model loaded into memory singleton from {artifact_path}")
            return _MODEL_ARTIFACT_CACHE
        except Exception as e:
            print(f"Failed to load ML model artifact: {e}")

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
    crop_age_days = (active_crop.planting_date).day  # Simple proxy or calculated age

    # 2. Fetch Soil & Waterlogging Risk
    existing_soil = db.query(SoilProfile).filter(SoilProfile.farm_id == farm.id).first()
    soil = soil_provider.resolve_soil_profile(farm.id, existing_soil, farm.latitude, farm.longitude, farm.state)
    waterlogging_res = calculate_waterlogging_risk(db, farm)
    rain_data = calculate_rainfall_analysis(farm.latitude, farm.longitude)

    derived = rain_data["derived_metrics"]
    raw = rain_data["raw_sources"]

    # 3. Assemble Feature Vector
    feature_dict = {
        "crop": crop_name,
        "crop_variety": variety_name,
        "crop_age_days": crop_age_days,
        "growth_stage": growth_stage,
        "soil_type": soil.soil_type,
        "soil_moisture": raw.get("current_humidity", 60.0) / 100.0,
        "drainage_class": farm.drainage_class or "MODERATE",
        "temperature_c": raw.get("current_temperature", 28.0),
        "humidity_pct": raw.get("current_humidity", 70.0),
        "rainfall_1h": derived["forecast_rain_1h"],
        "rainfall_6h": derived["forecast_rain_6h"],
        "rainfall_12h": derived["forecast_rain_12h"],
        "rainfall_24h": derived["forecast_rain_24h"],
        "rainfall_48h": derived["forecast_rain_48h"],
        "previous_rain_24h": derived["previous_rain_24h"],
        "previous_rain_48h": derived["previous_rain_48h"],
        "previous_rain_72h": derived["previous_rain_72h"],
        "peak_hourly_rainfall": derived["maximum_hourly_rainfall"],
        "continuous_rain_hours": derived["continuous_rain_hours"],
        "waterlogging_risk": waterlogging_res["risk_level"],
        "season": active_crop.season or "Kharif"
    }

    artifact = get_crop_damage_model_artifact()

    if artifact and "model" in artifact:
        model = artifact["model"]
        pipeline = artifact["pipeline"]
        X_vec = pipeline.transform_single(feature_dict)
        pred_encoded = model.predict(X_vec)[0]
        damage_class = pipeline.target_encoder.inverse_transform([pred_encoded])[0]

        # Probabilities if supported
        if hasattr(model, "predict_proba"):
            probas = model.predict_proba(X_vec)[0]
            confidence = round(float(np.max(probas)), 2)
        else:
            confidence = 0.90
        model_version = artifact.get("model_version", "v1.0.0")
    else:
        # Research / Rule-Based Baseline Fallback if model binary is missing
        model_version = "v1.0.0-rule-baseline"
        confidence = 0.85
        if waterlogging_res["risk_level"] == "CRITICAL":
            damage_class = "SEVERE"
        elif waterlogging_res["risk_level"] == "HIGH":
            damage_class = "MODERATE"
        elif waterlogging_res["risk_level"] == "MODERATE":
            damage_class = "MILD"
        else:
            damage_class = "NONE"

    # Map Damage Class to Yield Loss % & Survival Probability
    loss_map = {"NONE": 0.0, "MILD": 15.0, "MODERATE": 35.0, "SEVERE": 65.0, "TOTAL_LOSS": 90.0}
    estimated_yield_loss_pct = loss_map.get(damage_class, 10.0)
    survival_probability = round(max(0.05, 1.0 - (estimated_yield_loss_pct / 100.0)), 2)

    # Risk Enum Mapping for Database
    risk_enum_map = {
        "NONE": RiskLevelEnum.LOW,
        "MILD": RiskLevelEnum.LOW,
        "MODERATE": RiskLevelEnum.MODERATE,
        "SEVERE": RiskLevelEnum.HIGH,
        "TOTAL_LOSS": RiskLevelEnum.EXTREME
    }
    db_risk_enum = risk_enum_map.get(damage_class, RiskLevelEnum.MODERATE)

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
        "damage_class": damage_class,
        "survival_probability": survival_probability,
        "estimated_yield_loss_pct": estimated_yield_loss_pct,
        "confidence_score": confidence,
        "model_version": model_version,
        "main_input_factors": main_input_factors,
        "created_at": db_pred.created_at
    }
