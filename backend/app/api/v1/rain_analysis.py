from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.services.auth_service import get_current_user
from app.services.rain_analysis_service import calculate_rainfall_analysis

router = APIRouter(prefix="/farms", tags=["Rainfall Analysis"])


@router.get("/{farm_id}/rain-analysis")
def get_farm_rain_analysis(
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
        return calculate_rainfall_analysis(farm.latitude, farm.longitude)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
