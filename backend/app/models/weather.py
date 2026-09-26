from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Enum as SQLEnum, func
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import RiskLevelEnum


class WeatherForecast(Base):
    __tablename__ = "weather_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    forecast_time = Column(DateTime(timezone=True), nullable=False)
    temperature_min = Column(Float, nullable=True)
    temperature_max = Column(Float, nullable=True)
    relative_humidity = Column(Float, nullable=True)
    rain_amount_24h = Column(Float, nullable=False, default=0.0)
    rain_amount_48h = Column(Float, nullable=True)
    rain_intensity_mm_hr = Column(Float, nullable=False, default=0.0)
    forecast_source = Column(String(100), default="Open-Meteo", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="weather_forecasts")


class WeatherHistory(Base):
    __tablename__ = "weather_history"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    record_date = Column(Date, nullable=False)
    prior_24h_rain_mm = Column(Float, default=0.0, nullable=False)
    prior_48h_rain_mm = Column(Float, default=0.0, nullable=False)
    prior_72h_rain_mm = Column(Float, default=0.0, nullable=False)
    temp_avg = Column(Float, nullable=True)
    humidity_avg = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="weather_history")


class RainEvent(Base):
    __tablename__ = "rain_events"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    event_start = Column(DateTime(timezone=True), nullable=False)
    event_end = Column(DateTime(timezone=True), nullable=True)
    total_rainfall_mm = Column(Float, nullable=False)
    peak_intensity_mm_hr = Column(Float, nullable=False)
    duration_hours = Column(Float, nullable=False)
    alert_level = Column(SQLEnum(RiskLevelEnum, name="risklevelenum"), nullable=False, default=RiskLevelEnum.LOW)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="rain_events")
    waterlogging_predictions = relationship("WaterloggingPrediction", back_populates="rain_event")
