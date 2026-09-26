from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Enum as SQLEnum, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import SoilSourceEnum


class SoilProfile(Base):
    __tablename__ = "soil_profiles"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    soil_type = Column(String(100), nullable=False)
    sand_percentage = Column(Float, nullable=True)
    silt_percentage = Column(Float, nullable=True)
    clay_percentage = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    organic_carbon = Column(Float, nullable=True)
    bulk_density = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    soil_source = Column(SQLEnum(SoilSourceEnum, name="soilsourceenum"), nullable=False, default=SoilSourceEnum.ESTIMATED)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    farm = relationship("Farm", back_populates="soil_profile")
