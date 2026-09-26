from fastapi import APIRouter
from app.api.v1 import health, auth, farms, crops, soil, weather, rain_analysis, waterlogging, crop_damage

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(farms.router)
api_router.include_router(crops.router)
api_router.include_router(soil.router)
api_router.include_router(weather.router)
api_router.include_router(rain_analysis.router)
api_router.include_router(waterlogging.router)
api_router.include_router(crop_damage.router)




