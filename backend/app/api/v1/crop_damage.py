from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.prediction import CropDamagePrediction, PredictionExplanation
from app.services.auth_service import get_current_user
from app.services.crop_damage_service import run_crop_damage_inference
from app.services.explanation_service import format_explanation_payload

router = APIRouter(tags=["Crop Damage & Prediction History"])


@router.post("/farms/{farm_id}/analyse-crop-damage", status_code=status.HTTP_201_CREATED)
def analyse_farm_crop_damage(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )

    try:
        return run_crop_damage_inference(db, farm)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Crop damage inference failed: {str(e)}")


@router.get("/predictions/{prediction_id}/explanation")
def get_prediction_explanation(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Stage 13: GET /api/predictions/{prediction_id}/explanation
    Returns plain-language farmer statements, prediction method (ML/Hybrid/Evidence-Based),
    and technical feature importance snapshot.
    """
    pred = db.query(CropDamagePrediction).filter(CropDamagePrediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found."
        )

    # Verify farm ownership
    farm = db.query(Farm).filter(Farm.id == pred.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this prediction record."
        )

    explanation = db.query(PredictionExplanation).filter(PredictionExplanation.damage_pred_id == pred.id).first()
    explanation_text = explanation.explanation_text if explanation else "Analysis performed based on 48h rainfall forecast and soil drainage class."
    statements = explanation_text.split("\n") if explanation_text else []

    impact_res = {
        "engine_type": "HYBRID" if "v1.0.0" in pred.model_version else "RULE_BASED",
        "model_version": pred.model_version,
        "rule_version": "v1.0.0-tnau-icar",
        "calibrated_confidence": pred.survival_probability,
        "main_factors": [
            f"Damage Risk Level: {pred.damage_risk_level.value if hasattr(pred.damage_risk_level, 'value') else pred.damage_risk_level}",
            f"Survival Probability: {pred.survival_probability * 100:.0f}%",
            f"Estimated Yield Loss: {pred.estimated_yield_loss_pct:.1f}%"
        ]
    }

    return format_explanation_payload(prediction_id, impact_res, statements)


@router.get("/predictions/history")
def get_prediction_history(
    farm_id: Optional[int] = Query(None, description="Filter by Farm ID"),
    risk_level: Optional[str] = Query(None, description="Filter by Risk Level"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Stage 19: Prediction History & Examiner Audit Trail API.
    Lists past prediction snapshots with complete farm, crop, soil, weather, and explanation context.
    """
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]

    query = db.query(CropDamagePrediction).filter(CropDamagePrediction.farm_id.in_(user_farm_ids))

    if farm_id is not None:
        query = query.filter(CropDamagePrediction.farm_id == farm_id)

    predictions = query.order_by(CropDamagePrediction.created_at.desc()).all()

    history_items = []
    for p in predictions:
        farm = p.farm
        active_crop = p.farm_crop
        crop_name = active_crop.crop.name if active_crop and active_crop.crop else "Paddy"
        variety_name = active_crop.variety.variety_name if active_crop and active_crop.variety else "Standard"
        growth_stage = active_crop.user_stage_override if active_crop else "Vegetative"

        explanation = db.query(PredictionExplanation).filter(PredictionExplanation.damage_pred_id == p.id).first()

        risk_val = p.damage_risk_level.value if hasattr(p.damage_risk_level, 'value') else str(p.damage_risk_level)
        if risk_level and risk_level.upper() not in risk_val.upper():
            continue

        history_items.append({
            "prediction_id": p.id,
            "timestamp": p.created_at.isoformat() if hasattr(p.created_at, 'isoformat') else str(p.created_at),
            "farm_id": p.farm_id,
            "farm_name": farm.farm_name if farm else f"Farm #{p.farm_id}",
            "crop_name": crop_name,
            "variety_name": variety_name,
            "growth_stage": growth_stage,
            "damage_risk_level": risk_val,
            "survival_probability": p.survival_probability,
            "estimated_yield_loss_pct": p.estimated_yield_loss_pct,
            "prediction_method": "HYBRID" if "v1.0.0" in p.model_version else "RULE_BASED",
            "model_version": p.model_version,
            "rule_version": "v1.0.0-tnau-icar",
            "data_source": "Open-Meteo ERA5 & TNAU Knowledge Base",
            "explanation_summary": explanation.explanation_text if explanation else "48h Forecast & Drainage Analysis"
        })

    return history_items
