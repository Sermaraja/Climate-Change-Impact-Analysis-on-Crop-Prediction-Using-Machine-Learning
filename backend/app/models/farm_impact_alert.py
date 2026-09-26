from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class FarmImpactAlert(Base):
    __tablename__ = "farm_impact_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), index=True, nullable=False)
    farm_crop_id = Column(Integer, ForeignKey("farm_crops.id"), nullable=True)
    weather_forecast_id = Column(Integer, ForeignKey("weather_forecasts.id"), nullable=True)
    official_warning_id = Column(Integer, nullable=True)
    prediction_id = Column(Integer, ForeignKey("crop_damage_predictions.id"), nullable=True)

    # CropClimate AI Impact Classification
    application_impact_level = Column(String(50), nullable=False, default="GREEN")  # GREEN, YELLOW, ORANGE, RED
    rain_risk = Column(String(50), nullable=True)
    waterlogging_risk = Column(String(50), nullable=True)
    damage_risk = Column(String(50), nullable=True)
    survival_class = Column(String(50), nullable=True)
    recovery_class = Column(String(50), nullable=True)
    loss_risk = Column(String(50), nullable=True)

    # Weather metrics snapshot
    forecast_start = Column(DateTime, nullable=True)
    forecast_end = Column(DateTime, nullable=True)
    rain_24h = Column(Float, nullable=True)
    rain_48h = Column(Float, nullable=True)
    previous_rain_72h = Column(Float, nullable=True)

    # Explanations & Engine Metadata
    main_factors = Column(JSON, nullable=True)
    engine_type = Column(String(50), default="HYBRID")

    # Alert Lifecycle Status
    status = Column(String(50), default="ACTIVE", index=True)  # ACTIVE, ACKNOWLEDGED, RESOLVED
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    user = relationship("User", backref="farm_impact_alerts")
    farm = relationship("Farm", backref="farm_impact_alerts")
    farm_crop = relationship("FarmCrop", backref="farm_impact_alerts")
    prediction = relationship("CropDamagePrediction", backref="farm_impact_alerts")
