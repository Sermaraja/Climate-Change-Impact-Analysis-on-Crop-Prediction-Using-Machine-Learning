"""
Farm & Crop Impact API Endpoints
Core API providing multi-farm scanning, farm-specific impact evaluation,
map polygons with impact badges, and factor explanations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from app.models.user import User
from app.models.farm import Farm
from app.services.auth_service import get_current_user
from app.services.farm_impact_scanner import farm_impact_scanner, scan_single_farm_impact

router = APIRouter(prefix="/farm-impact", tags=["Farm & Crop Impact"])


@router.post("/analyse-all", summary="Run comprehensive impact scan for all user farms")
def analyse_all_farms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Executes real-time end-to-end impact evaluation across all active farms of current user:
    Weather -> Rainfall -> Soil -> Waterlogging -> Crop Impact -> Recommendations.
    """
    return farm_impact_scanner.scan_all_user_farms(db, current_user.id)


@router.get("/summary", summary="Get cached or latest farm impact summary and alert status")
def get_farm_impact_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Returns overview of farms requiring attention and risk classifications."""
    return farm_impact_scanner.scan_all_user_farms(db, current_user.id)


@router.post("/farms/{farm_id}/analyse", summary="Analyse single farm impact")
def analyse_farm_impact(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm with id {farm_id} not found."
        )
    return scan_single_farm_impact(db, farm)


@router.get("/farms/{farm_id}", summary="Get single farm impact details")
def get_farm_impact_detail(
    farm_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm with id {farm_id} not found."
        )
    return scan_single_farm_impact(db, farm)


@router.get("/map", summary="Get all farms with GeoJSON boundaries and current impact levels for Leaflet map")
def get_farm_impact_map_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    full_scan = farm_impact_scanner.scan_all_user_farms(db, current_user.id)
    features = []
    for f in full_scan.get("farms", []):
        geojson = f.get("boundary_geojson")
        features.append({
            "type": "Feature",
            "geometry": geojson,
            "properties": {
                "farm_id": f["farm_id"],
                "farm_name": f["farm_name"],
                "latitude": f["latitude"],
                "longitude": f["longitude"],
                "area_acres": f["area_acres"],
                "has_crop": f["has_crop"],
                "crop_name": f.get("active_crop", {}).get("crop_name") if f["has_crop"] else None,
                "growth_stage": f.get("active_crop", {}).get("growth_stage") if f["has_crop"] else None,
                "crop_age_days": f.get("active_crop", {}).get("crop_age_days") if f["has_crop"] else None,
                "application_impact_level": f.get("crop_impact_analysis", {}).get("application_impact_level", "UNKNOWN") if f["has_crop"] else "UNKNOWN",
                "waterlogging_risk": f.get("waterlogging_analysis", {}).get("risk_level", "UNKNOWN") if f["has_crop"] else "UNKNOWN",
                "damage_risk": f.get("crop_impact_analysis", {}).get("damage_risk", "UNKNOWN") if f["has_crop"] else "UNKNOWN",
                "survival_potential": f.get("crop_impact_analysis", {}).get("survival_potential", "UNKNOWN") if f["has_crop"] else "UNKNOWN",
                "recovery_potential": f.get("crop_impact_analysis", {}).get("recovery_potential", "UNKNOWN") if f["has_crop"] else "UNKNOWN",
                "forecast_rain_24h_mm": f.get("weather_metrics", {}).get("forecast_rain_24h_mm", 0.0) if f["has_crop"] else 0.0,
                "status_message": f.get("status_message")
            }
        })
    return {
        "type": "FeatureCollection",
        "summary": full_scan.get("summary", {}),
        "official_weather_warning": full_scan.get("official_weather_warning"),
        "features": features
    }
