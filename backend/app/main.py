from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.config import settings
from app.api.router import api_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed crop master data on startup (idempotent)
    try:
        from app.seed_crops import seed_crops
        seed_crops()
        logger.info("Crop master data verified/seeded.")
    except Exception as e:
        logger.warning(f"Crop seed skipped: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for Climate Change Impact Analysis on Crop Prediction Using Machine Learning",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "Welcome to Climate Change Impact Analysis API",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/health", tags=["Health"])
def health_probe():
    return {
        "status": "healthy",
        "application": settings.PROJECT_NAME,
        "version": settings.VERSION
    }
