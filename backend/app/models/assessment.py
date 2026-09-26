from sqlalchemy import Column, Integer, String, Float, Text, Date, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class PostRainAssessment(Base):
    __tablename__ = "post_rain_assessments"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_crop_id = Column(Integer, ForeignKey("farm_crops.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_date = Column(Date, nullable=False)
    standing_water = Column(String(20), nullable=False, default="NO") # YES / NO
    standing_water_duration = Column(String(50), nullable=True) # <6 hours, 6-12 hours, 12-24 hours, 24-48 hours, >48 hours, Unknown
    leaf_condition = Column(String(50), nullable=True) # Normal, Yellowing, Wilting, Severe damage
    plant_condition = Column(String(50), nullable=True) # Standing, Partial lodging, Severe lodging
    visible_damage = Column(String(50), nullable=True) # Low, Moderate, High
    actual_waterlogging_hours = Column(Float, nullable=True)
    actual_damage_observed = Column(String(100), nullable=True)
    updated_recovery_potential = Column(String(50), nullable=True, default="MEDIUM") # LOW, MEDIUM, HIGH
    updated_crop_loss_risk = Column(String(50), nullable=True, default="MODERATE") # LOW, MODERATE, HIGH
    farmer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="post_rain_assessments")
    farm_crop = relationship("FarmCrop", back_populates="post_rain_assessments")
