from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.services.auth_service import get_current_user
from app.services.weather_service import (
    fetch_open_meteo_data,
    parse_current_weather,
    parse_forecast_weather,
    parse_historical_weather
)

router = APIRouter(prefix="/farms", tags=["Weather Integration"])


@router.get("/{farm_id}/weather/current")
def get_current_farm_weather(
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
        raw_data = fetch_open_meteo_data(farm.latitude, farm.longitude)
        return parse_current_weather(raw_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.get("/{farm_id}/weather/forecast")
def get_farm_weather_forecast(
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
        raw_data = fetch_open_meteo_data(farm.latitude, farm.longitude)
        return parse_forecast_weather(raw_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))


@router.get("/{farm_id}/weather/history")
def get_farm_weather_history(
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
        raw_data = fetch_open_meteo_data(farm.latitude, farm.longitude)
        return parse_historical_weather(raw_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
