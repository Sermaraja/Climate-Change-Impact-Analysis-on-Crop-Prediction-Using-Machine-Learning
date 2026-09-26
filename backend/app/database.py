from datetime import datetime, timezone
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Engine setup
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
engine_kwargs = {"connect_args": {"check_same_thread": False}} if is_sqlite else {}

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# SQLite fallback helper for GeoAlchemy2 PostGIS functions during offline testing
if is_sqlite:
    @event.listens_for(engine, "connect")
    def register_sqlite_gis_functions(dbapi_connection, connection_record):
        dbapi_connection.create_function("GeomFromEWKT", 1, lambda val: val)
        dbapi_connection.create_function("GeomFromText", 1, lambda val: val)
        dbapi_connection.create_function("AsEWKB", 1, lambda val: val.encode('utf-8') if isinstance(val, str) else val)
        dbapi_connection.create_function("AsText", 1, lambda val: val.decode('utf-8') if isinstance(val, bytes) else str(val))
        dbapi_connection.create_function("ST_AsGeoJSON", 1, lambda val: val)
        dbapi_connection.create_function("now", 0, lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
