from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    scientific_name = Column(String(150), nullable=True)
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    varieties = relationship("CropVariety", back_populates="crop", cascade="all, delete-orphan")
    growth_stages = relationship("CropGrowthStage", back_populates="crop", cascade="all, delete-orphan")
    farm_crops = relationship("FarmCrop", back_populates="crop")


class CropVariety(Base):
    __tablename__ = "crop_varieties"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    variety_name = Column(String(100), nullable=False)
    duration_days = Column(Integer, nullable=True)
    submergence_tolerance_days = Column(Integer, default=2, nullable=False)
    drought_tolerance = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    crop = relationship("Crop", back_populates="varieties")
    farm_crops = relationship("FarmCrop", back_populates="variety")


class CropGrowthStage(Base):
    __tablename__ = "crop_growth_stages"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    stage_name = Column(String(100), nullable=False)
    stage_order = Column(Integer, nullable=False)
    min_age_days = Column(Integer, nullable=False)
    max_age_days = Column(Integer, nullable=False)
    flood_vulnerability_level = Column(String(50), nullable=False, default="MODERATE")
    submergence_limit_hours = Column(Integer, default=24, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    crop = relationship("Crop", back_populates="growth_stages")
    farm_crops = relationship("FarmCrop", back_populates="current_growth_stage")


class FarmCrop(Base):
    __tablename__ = "farm_crops"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="RESTRICT"), nullable=False, index=True)
    variety_id = Column(Integer, ForeignKey("crop_varieties.id", ondelete="SET NULL"), nullable=True)
    planting_date = Column(Date, nullable=False)
    estimated_age_days = Column(Integer, nullable=True)
    current_growth_stage_id = Column(Integer, ForeignKey("crop_growth_stages.id", ondelete="SET NULL"), nullable=True)
    user_stage_override = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    farm = relationship("Farm", back_populates="farm_crops")
    crop = relationship("Crop", back_populates="farm_crops")
    variety = relationship("CropVariety", back_populates="farm_crops")
    current_growth_stage = relationship("CropGrowthStage", back_populates="farm_crops")
    damage_predictions = relationship("CropDamagePrediction", back_populates="farm_crop", cascade="all, delete-orphan")
    post_rain_assessments = relationship("PostRainAssessment", back_populates="farm_crop", cascade="all, delete-orphan")
