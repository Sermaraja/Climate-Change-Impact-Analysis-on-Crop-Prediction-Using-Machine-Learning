import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Climate Change Impact Analysis on Crop Prediction Using Machine Learning"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database (uses postgresql+psycopg2:// or sqlite:///./climate_crop_test.db for local testing if pg is offline)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./climate_crop.db"
    )

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
