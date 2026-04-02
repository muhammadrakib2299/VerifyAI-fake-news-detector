"""Database connection and session management."""

import logging
import time

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

logger = logging.getLogger(__name__)

# SQLite needs special handling for foreign keys
is_sqlite = settings.database_url.startswith("sqlite")
connect_args = {}
engine_kwargs = {"pool_pre_ping": True}

if is_sqlite:
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL (Neon) — give the serverless database time to wake up
    connect_args["connect_timeout"] = 30
    connect_args["options"] = "-c statement_timeout=60000"
    engine_kwargs.update(
        pool_size=5,
        max_overflow=10,
        pool_timeout=60,
        pool_recycle=300,
    )

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    **engine_kwargs,
)

# Enable foreign key support for SQLite
if is_sqlite:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables with retry for Neon cold starts."""
    for attempt in range(1, 4):
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully.")
            return
        except Exception as e:
            logger.warning(
                "DB connection attempt %d/3 failed: %s", attempt, e
            )
            if attempt < 3:
                time.sleep(5 * attempt)
            else:
                raise
