"""
Alert Service
Manages lifecycle for FarmImpactAlert: ACTIVE, ACKNOWLEDGED, RESOLVED.
Tracks escalation and historical transitions.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.farm_impact_alert import FarmImpactAlert
from app.models.farm import Farm
from app.models.crop import FarmCrop

logger = logging.getLogger("alert_service")


class AlertService:
    @staticmethod
    def get_user_alerts(
        db: Session,
        user_id: int,
        status_filter: Optional[str] = None,
        limit: int = 50
    ) -> List[FarmImpactAlert]:
        query = db.query(FarmImpactAlert).filter(FarmImpactAlert.user_id == user_id)
        if status_filter and status_filter.upper() != "ALL":
            query = query.filter(FarmImpactAlert.status == status_filter.upper())
        return query.order_by(desc(FarmImpactAlert.created_at)).limit(limit).all()

    @staticmethod
    def get_alert_by_id(db: Session, alert_id: int, user_id: int) -> Optional[FarmImpactAlert]:
        return (
            db.query(FarmImpactAlert)
            .filter(FarmImpactAlert.id == alert_id, FarmImpactAlert.user_id == user_id)
            .first()
        )

    @staticmethod
    def acknowledge_alert(db: Session, alert_id: int, user_id: int) -> Optional[FarmImpactAlert]:
        alert = AlertService.get_alert_by_id(db, alert_id, user_id)
        if not alert:
            return None
        alert.status = "ACKNOWLEDGED"
        alert.acknowledged_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(alert)
        logger.info(f"Alert {alert_id} acknowledged by user {user_id}")
        return alert

    @staticmethod
    def resolve_alert(db: Session, alert_id: int, user_id: int) -> Optional[FarmImpactAlert]:
        alert = AlertService.get_alert_by_id(db, alert_id, user_id)
        if not alert:
            return None
        alert.status = "RESOLVED"
        alert.resolved_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(alert)
        logger.info(f"Alert {alert_id} resolved by user {user_id}")
        return alert

    @staticmethod
    def upsert_farm_impact_alert(
        db: Session,
        user_id: int,
        farm_id: int,
        farm_crop_id: Optional[int],
        application_impact_level: str,
        rain_risk: str,
        waterlogging_risk: str,
        damage_risk: str,
        survival_class: str,
        recovery_class: str,
        loss_risk: str,
        rain_24h: float,
        rain_48h: float,
        previous_rain_72h: float,
        main_factors: List[str],
        engine_type: str = "HYBRID",
        prediction_id: Optional[int] = None,
        forecast_start: Optional[datetime] = None,
        forecast_end: Optional[datetime] = None,
        official_warning_id: Optional[int] = None
    ) -> FarmImpactAlert:
        """
        Finds existing active or acknowledged alert for farm.
        If impact level or factors changed, updates and records history.
        Otherwise keeps single source of truth to avoid alert spam.
        """
        existing = (
            db.query(FarmImpactAlert)
            .filter(
                FarmImpactAlert.user_id == user_id,
                FarmImpactAlert.farm_id == farm_id,
                FarmImpactAlert.status.in_(["ACTIVE", "ACKNOWLEDGED"])
            )
            .order_by(desc(FarmImpactAlert.created_at))
            .first()
        )

        level_order = {"GREEN": 1, "YELLOW": 2, "ORANGE": 3, "RED": 4}

        if existing:
            # Check for escalation
            old_level_score = level_order.get(existing.application_impact_level, 1)
            new_level_score = level_order.get(application_impact_level, 1)

            if new_level_score > old_level_score:
                logger.info(f"Escalating alert for farm {farm_id}: {existing.application_impact_level} -> {application_impact_level}")
                existing.status = "ACTIVE"  # Re-activate if escalated

            existing.application_impact_level = application_impact_level
            existing.rain_risk = rain_risk
            existing.waterlogging_risk = waterlogging_risk
            existing.damage_risk = damage_risk
            existing.survival_class = survival_class
            existing.recovery_class = recovery_class
            existing.loss_risk = loss_risk
            existing.rain_24h = rain_24h
            existing.rain_48h = rain_48h
            existing.previous_rain_72h = previous_rain_72h
            existing.main_factors = main_factors
            existing.engine_type = engine_type
            existing.prediction_id = prediction_id
            existing.forecast_start = forecast_start
            existing.forecast_end = forecast_end
            existing.official_warning_id = official_warning_id
            db.commit()
            db.refresh(existing)
            return existing

        new_alert = FarmImpactAlert(
            user_id=user_id,
            farm_id=farm_id,
            farm_crop_id=farm_crop_id,
            official_warning_id=official_warning_id,
            prediction_id=prediction_id,
            application_impact_level=application_impact_level,
            rain_risk=rain_risk,
            waterlogging_risk=waterlogging_risk,
            damage_risk=damage_risk,
            survival_class=survival_class,
            recovery_class=recovery_class,
            loss_risk=loss_risk,
            forecast_start=forecast_start,
            forecast_end=forecast_end,
            rain_24h=rain_24h,
            rain_48h=rain_48h,
            previous_rain_72h=previous_rain_72h,
            main_factors=main_factors,
            engine_type=engine_type,
            status="ACTIVE"
        )
        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)
        return new_alert


alert_service = AlertService()
