from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.services.auth_service import get_current_user
from app.services.waterlogging_service import calculate_waterlogging_risk

router = APIRouter(prefix="/farms", tags=["Waterlogging Risk Engine"])


@router.post("/{farm_id}/waterlogging-analysis", status_code=status.HTTP_201_CREATED)
def run_waterlogging_analysis(
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
        return calculate_waterlogging_risk(db, farm)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Waterlogging calculation failed: {str(e)}")


@router.get("/{farm_id}/waterlogging-analysis")
def get_latest_waterlogging_analysis(
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

    # Run fresh calculation
    return calculate_waterlogging_risk(db, farm)
