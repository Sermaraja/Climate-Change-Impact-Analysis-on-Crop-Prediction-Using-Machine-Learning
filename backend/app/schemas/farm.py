from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class FarmCreate(BaseModel):
    farm_name: str
    latitude: float
    longitude: float
    boundary_geojson: Optional[Dict[str, Any]] = None  # GeoJSON Polygon
    area_acres: float
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    drainage_class: str = "MODERATE"


class FarmUpdate(BaseModel):
    farm_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    boundary_geojson: Optional[Dict[str, Any]] = None
    area_acres: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    drainage_class: Optional[str] = None


class FarmResponse(BaseModel):
    id: int
    user_id: int
    farm_name: str
    latitude: float
    longitude: float
    boundary_geojson: Optional[Dict[str, Any]] = None
    area_acres: float
    area_hectares: float
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    drainage_class: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
