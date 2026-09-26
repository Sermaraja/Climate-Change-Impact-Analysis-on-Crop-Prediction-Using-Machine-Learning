from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.models.crop import FarmCrop
from app.models.assessment import PostRainAssessment
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/farms", tags=["Post-Rain Assessment"])


class PostRainAssessmentCreate(BaseModel):
    standing_water: str = Field(default="YES", description="YES / NO")
    standing_water_duration: str = Field(default="12-24 hours", description="<6 hours, 6-12 hours, 12-24 hours, 24-48 hours, >48 hours, Unknown")
    leaf_condition: str = Field(default="Yellowing", description="Normal, Yellowing, Wilting, Severe damage")
    plant_condition: str = Field(default="Standing", description="Standing, Partial lodging, Severe lodging")
    visible_damage: str = Field(default="Moderate", description="Low, Moderate, High")
    farmer_notes: Optional[str] = None


@router.post("/{farm_id}/post-rain-assessment", status_code=status.HTTP_201_CREATED)
def submit_post_rain_assessment(
    farm_id: int,
    payload: PostRainAssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Stage 16: Post-Rain Assessment.
    Stores observed actual field conditions separately from predicted conditions.
    Recalculates updated recovery potential, crop loss risk, and next actions.
    """
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found or access denied.")

    active_crop = (
        db.query(FarmCrop)
        .filter(FarmCrop.farm_id == farm.id, FarmCrop.is_active == True)
        .order_by(FarmCrop.created_at.desc())
        .first()
    )
    if not active_crop:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active crop profile registered for this farm.")

    crop_name = active_crop.crop.name if active_crop.crop else "Paddy"

    # Recalculate Updated Recovery Potential based on actual field observations
    dur = payload.standing_water_duration
    leaf = payload.leaf_condition
    vis = payload.visible_damage

    if dur in [">48 hours", "24-48 hours"] or leaf == "Severe damage" or vis == "High":
        updated_recovery = "LOW" if crop_name not in ["Paddy"] else "MEDIUM"
        updated_loss_risk = "HIGH"
    elif dur in ["12-24 hours"] or leaf in ["Yellowing", "Wilting"] or vis == "Moderate":
        updated_recovery = "MEDIUM"
        updated_loss_risk = "MODERATE"
    else:
        updated_recovery = "HIGH"
        updated_loss_risk = "LOW"

    # Next Actions list based on actual field status
    next_actions = []
    if payload.standing_water == "YES":
        next_actions.append("Channel out standing water immediately to avoid further root anoxia.")
    if leaf in ["Yellowing", "Wilting"]:
        next_actions.append("Apply foliar spray of 1% Urea + 0.5% Zinc Sulphate to assist chlorophyll restoration.")
    if vis in ["Moderate", "High"]:
        next_actions.append("Drench soil with Copper Oxychloride (2.5g/L) to prevent secondary fungal root rot.")

    # Save to Database
    assessment = PostRainAssessment(
        farm_id=farm.id,
        farm_crop_id=active_crop.id,
        assessment_date=date.today(),
        standing_water=payload.standing_water,
        standing_water_duration=payload.standing_water_duration,
        leaf_condition=payload.leaf_condition,
        plant_condition=payload.plant_condition,
        visible_damage=payload.visible_damage,
        actual_waterlogging_hours=36.0 if dur == ">48 hours" else (18.0 if dur == "12-24 hours" else 6.0),
        actual_damage_observed=f"Leaf: {leaf}, Plant: {payload.plant_condition}, Damage: {vis}",
        updated_recovery_potential=updated_recovery,
        updated_crop_loss_risk=updated_loss_risk,
        farmer_notes=payload.farmer_notes
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "assessment_id": assessment.id,
        "farm_id": farm.id,
        "assessment_date": assessment.assessment_date.isoformat(),
        "observed_conditions": {
            "standing_water": payload.standing_water,
            "standing_water_duration": payload.standing_water_duration,
            "leaf_condition": payload.leaf_condition,
            "plant_condition": payload.plant_condition,
            "visible_damage": payload.visible_damage
        },
        "updated_evaluation": {
            "updated_recovery_potential": updated_recovery,
            "updated_crop_loss_risk": updated_loss_risk,
            "next_actions": next_actions
        },
        "created_at": assessment.created_at.isoformat() if hasattr(assessment.created_at, 'isoformat') else str(assessment.created_at)
    }


@router.get("/{farm_id}/post-rain-assessment")
def get_post_rain_assessments(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found or access denied.")

    assessments = (
        db.query(PostRainAssessment)
        .filter(PostRainAssessment.farm_id == farm.id)
        .order_by(PostRainAssessment.created_at.desc())
        .all()
    )

    return [
        {
            "id": a.id,
            "assessment_date": a.assessment_date.isoformat(),
            "standing_water": a.standing_water,
            "standing_water_duration": a.standing_water_duration,
            "leaf_condition": a.leaf_condition,
            "plant_condition": a.plant_condition,
            "visible_damage": a.visible_damage,
            "updated_recovery_potential": a.updated_recovery_potential,
            "updated_crop_loss_risk": a.updated_crop_loss_risk,
            "farmer_notes": a.farmer_notes,
            "created_at": a.created_at.isoformat() if hasattr(a.created_at, 'isoformat') else str(a.created_at)
        }
        for a in assessments
    ]
