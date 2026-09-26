import logging
from sqlalchemy import text, event
from app.database import engine, Base
from app.models import *  # noqa: F401, F403

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

        # If running on SQLite fallback for testing, remove GeoAlchemy2 after_create DDL listener
        if engine.dialect.name == "sqlite":
            try:
                from geoalchemy2.admin import after_create
                event.remove(Base.metadata, "after_create", after_create)
            except Exception:
                pass

        # Create all tables defined in models
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise e


if __name__ == "__main__":
    init_db()
