from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.enums import SoilSourceEnum


class SoilProfileCreate(BaseModel):
    soil_type: str = Field(..., description="e.g. Clay Loam, Alluvial, Sandy Loam, Black Cotton")
    sand_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    silt_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    clay_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    ph: Optional[float] = Field(default=None, ge=0, le=14)
    organic_carbon: Optional[float] = Field(default=None, ge=0)
    bulk_density: Optional[float] = Field(default=None, ge=0)
    soil_source: SoilSourceEnum = Field(default=SoilSourceEnum.FARMER_VERIFIED)
    notes: Optional[str] = None


class SoilProfileUpdate(BaseModel):
    soil_type: Optional[str] = None
    sand_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    silt_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    clay_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    ph: Optional[float] = Field(default=None, ge=0, le=14)
    organic_carbon: Optional[float] = Field(default=None, ge=0)
    bulk_density: Optional[float] = Field(default=None, ge=0)
    soil_source: Optional[SoilSourceEnum] = None
    notes: Optional[str] = None


class SoilProfileResponse(BaseModel):
    id: Optional[int] = None
    farm_id: int
    soil_type: str
    sand_percentage: Optional[float] = None
    silt_percentage: Optional[float] = None
    clay_percentage: Optional[float] = None
    ph: Optional[float] = None
    organic_carbon: Optional[float] = None
    bulk_density: Optional[float] = None
    soil_source: SoilSourceEnum
    notes: Optional[str] = None
    is_estimated_fallback: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
