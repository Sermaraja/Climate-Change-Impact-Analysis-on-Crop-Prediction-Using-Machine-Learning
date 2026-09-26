from fastapi import APIRouter
from app.api.v1 import health, auth, farms

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(farms.router)
