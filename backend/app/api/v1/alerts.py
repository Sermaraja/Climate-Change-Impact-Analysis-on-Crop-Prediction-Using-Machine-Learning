"""
Alerts API Router
Manages Farm & Crop Impact alerts lifecycle: ACTIVE, ACKNOWLEDGED, RESOLVED.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.alert_service import alert_service
from app.models.farm_impact_alert import FarmImpactAlert

router = APIRouter(prefix="/alerts", tags=["Farm & Crop Alerts"])


def format_alert_response(alert: FarmImpactAlert) -> Dict[str, Any]:
    farm = alert.farm
    active_crop = alert.farm_crop

    crop_name = active_crop.crop.name if active_crop and active_crop.crop else "Unknown Crop"
    growth_stage = (
        active_crop.user_stage_override or
        (active_crop.current_growth_stage.stage_name if active_crop and active_crop.current_growth_stage else "Vegetative")
    ) if active_crop else "N/A"

    return {
        "id": alert.id,
        "farm_id": alert.farm_id,
        "farm_name": farm.farm_name if farm else "Unknown Farm",
        "location": f"{farm.district or ''}, {farm.state or ''}".strip(", ") if farm else "N/A",
        "crop_name": crop_name,
        "growth_stage": growth_stage,
        "application_impact_level": alert.application_impact_level,
        "rain_risk": alert.rain_risk,
        "waterlogging_risk": alert.waterlogging_risk,
        "damage_risk": alert.damage_risk,
        "survival_class": alert.survival_class,
        "recovery_class": alert.recovery_class,
        "loss_risk": alert.loss_risk,
        "rain_24h": alert.rain_24h,
        "rain_48h": alert.rain_48h,
        "previous_rain_72h": alert.previous_rain_72h,
        "main_factors": alert.main_factors or [],
        "engine_type": alert.engine_type,
        "status": alert.status,
        "created_at": alert.created_at.isoformat() if hasattr(alert.created_at, 'isoformat') else str(alert.created_at),
        "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
        "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
    }


@router.get("", summary="Get all alerts for current user")
def list_user_alerts(
    status_filter: Optional[str] = Query("ALL", description="Filter by ACTIVE, ACKNOWLEDGED, RESOLVED, or ALL"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    alerts = alert_service.get_user_alerts(db, current_user.id, status_filter=status_filter)
    return [format_alert_response(a) for a in alerts]


@router.get("/history", summary="Get historical and resolved alerts")
def get_alert_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    alerts = alert_service.get_user_alerts(db, current_user.id, status_filter=None, limit=100)
    return [format_alert_response(a) for a in alerts]


@router.get("/{alert_id}", summary="Get specific alert details")
def get_alert_detail(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    alert = alert_service.get_alert_by_id(db, alert_id, current_user.id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
    return format_alert_response(alert)


@router.post("/{alert_id}/acknowledge", summary="Acknowledge active alert")
def acknowledge_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    alert = alert_service.acknowledge_alert(db, alert_id, current_user.id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
    return format_alert_response(alert)


@router.post("/{alert_id}/resolve", summary="Resolve alert")
def resolve_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    alert = alert_service.resolve_alert(db, alert_id, current_user.id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
    return format_alert_response(alert)
