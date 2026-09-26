from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class CropVarietyResponse(BaseModel):
    id: int
    variety_name: str
    duration_days: Optional[int] = None
    submergence_tolerance_days: int = 2
    drought_tolerance: Optional[str] = None

    class Config:
        from_attributes = True


class CropGrowthStageResponse(BaseModel):
    id: int
    stage_name: str
    stage_order: int
    min_age_days: int
    max_age_days: int
    flood_vulnerability_level: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class CropResponse(BaseModel):
    id: int
    name: str
    scientific_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    varieties: List[CropVarietyResponse] = []
    growth_stages: List[CropGrowthStageResponse] = []

    class Config:
        from_attributes = True


class FarmCropCreate(BaseModel):
    crop_id: int
    variety_id: Optional[int] = None
    planting_date: date
    season: Optional[str] = Field(default=None, description="Kharif, Rabi, Zaid, Perennial, Summer")
    user_stage_override: Optional[str] = Field(default=None, description="Farmer confirmed growth stage override")


class FarmCropUpdate(BaseModel):
    crop_id: Optional[int] = None
    variety_id: Optional[int] = None
    planting_date: Optional[date] = None
    season: Optional[str] = None
    status: Optional[str] = None
    user_stage_override: Optional[str] = Field(default=None, description="Farmer confirmed growth stage override")


class FarmCropResponse(BaseModel):
    id: int
    farm_id: int
    crop_id: int
    crop_name: str
    scientific_name: Optional[str] = None
    variety_id: Optional[int] = None
    variety_name: Optional[str] = None
    planting_date: date
    crop_age_days: int
    estimated_growth_stage: str
    confirmed_growth_stage: Optional[str] = None
    growth_stage: str
    season: Optional[str] = None
    status: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
