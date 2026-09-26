from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.services.auth_service import get_current_user
from app.services.crop_damage_service import run_crop_damage_inference

router = APIRouter(prefix="/farms", tags=["Crop Damage ML Model"])


@router.post("/{farm_id}/analyse-crop-damage", status_code=status.HTTP_201_CREATED)
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


@router.get("/{farm_id}/analyse-crop-damage")
def get_farm_crop_damage_analysis(
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
