from sqlalchemy import Column, Integer, String, Float, Text, Date, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class PostRainAssessment(Base):
    __tablename__ = "post_rain_assessments"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_crop_id = Column(Integer, ForeignKey("farm_crops.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_date = Column(Date, nullable=False)
    actual_waterlogging_hours = Column(Float, nullable=True)
    actual_damage_observed = Column(String(100), nullable=True)
    farmer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="post_rain_assessments")
    farm_crop = relationship("FarmCrop", back_populates="post_rain_assessments")
