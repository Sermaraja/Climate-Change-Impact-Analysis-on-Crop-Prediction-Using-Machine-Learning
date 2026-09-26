from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.services.auth_service import get_current_user
from app.services.rain_analysis_service import calculate_rainfall_analysis
from app.services.analyse_crop_service import run_full_analyse_my_crop_pipeline
from app.services.climate_analysis_service import calculate_longterm_climate_analysis

router = APIRouter(prefix="/farms", tags=["Rainfall & Climate Analysis"])


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


@router.get("/{farm_id}/climate-analysis")
def get_farm_climate_analysis(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Stage 17: GET /api/farms/{farm_id}/climate-analysis
    Returns 30-year multi-decade rainfall, temperature, heavy rain days, and extreme indicators.
    """
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )

    return calculate_longterm_climate_analysis(farm.latitude, farm.longitude)


@router.post("/{farm_id}/analyse-rain-impact", status_code=status.HTTP_201_CREATED)
def analyse_farm_rain_impact(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Stage 14: End-to-end Analyse My Crop master pipeline.
    Runs weather, waterlogging, hybrid ML+TNAU impact engine, explanation, and action recommendations.
    """
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found or access denied."
        )

    try:
        return run_full_analyse_my_crop_pipeline(db, farm)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analyse My Crop pipeline execution failed: {str(e)}"
        )
