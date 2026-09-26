from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.database import Base


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    boundary = Column(Geometry(geometry_type="POLYGON", srid=4326, use_typmod=True), nullable=True)
    area_acres = Column(Float, nullable=False)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    village = Column(String(100), nullable=True)
    drainage_class = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    user = relationship("User", back_populates="farms")
    soil_profile = relationship("SoilProfile", back_populates="farm", uselist=False, cascade="all, delete-orphan")
    farm_crops = relationship("FarmCrop", back_populates="farm", cascade="all, delete-orphan")
    weather_forecasts = relationship("WeatherForecast", back_populates="farm", cascade="all, delete-orphan")
    weather_history = relationship("WeatherHistory", back_populates="farm", cascade="all, delete-orphan")
    rain_events = relationship("RainEvent", back_populates="farm", cascade="all, delete-orphan")
    waterlogging_predictions = relationship("WaterloggingPrediction", back_populates="farm", cascade="all, delete-orphan")
    crop_damage_predictions = relationship("CropDamagePrediction", back_populates="farm", cascade="all, delete-orphan")
    crop_recovery_predictions = relationship("CropRecoveryPrediction", back_populates="farm", cascade="all, delete-orphan")
    post_rain_assessments = relationship("PostRainAssessment", back_populates="farm", cascade="all, delete-orphan")
