import logging
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import engine, Base

from app.models import *  # noqa: F401, F403
import geoalchemy2.admin.dialects.sqlite

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("init_db")


def init_db():
    logger.info("Initializing database schema...")
    try:
        with engine.connect() as conn:
            # Enable PostGIS extension if PostgreSQL
            if engine.dialect.name == "postgresql":
                logger.info("Enabling PostGIS extension...")
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()

        # If running on SQLite fallback for testing, disable GeoAlchemy2 SpatiaLite DDL hook
        if engine.dialect.name == "sqlite":
            geoalchemy2.admin.dialects.sqlite.after_create = lambda table, bind, **kw: None

        # Create all tables defined in models
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")

        # Seed initial crop master
        from app.seed_crops import seed_crops
        with Session(engine) as session:
            seed_crops(session)
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise e


if __name__ == "__main__":
    init_db()

