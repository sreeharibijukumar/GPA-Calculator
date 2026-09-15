import logging
import os
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import QueuePool

load_dotenv()

log = logging.getLogger(__name__)

# Neon/Supabase provide "postgres://" URLs; SQLAlchemy 1.4+ requires "postgresql://"
DATABASE_URL: str = os.environ["DATABASE_URL"]
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=2,
    pool_recycle=300,
    pool_pre_ping=True,
    echo=os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true",
)

# Neon pauses compute after ~5 min of inactivity on the free tier.
# pool_pre_ping handles transparent reconnection when compute resumes.
@event.listens_for(engine, "connect")
def on_connect(dbapi_conn, connection_record):
    pass

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    """All ORM model classes inherit from this. Holds the metadata registry."""

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# Default CSV path — bundled alongside the app package.
_SEED_CSV: Path = Path(__file__).parent / "data" / "courses_master.csv"

def init_db() -> None:
    """
    Called once during FastAPI's lifespan startup event.

    Steps:
      1. ``create_all`` — idempotently creates missing tables.
      2. CSV seeder — skipped gracefully if the CSV file is absent (e.g. CI).
    """
    from app import models  # noqa: F401  — registers all ORM metadata
    Base.metadata.create_all(bind=engine)

    if _SEED_CSV.exists():
        from app.seed_data import seed_from_csv
        with get_db_context() as db:
            seed_from_csv(db, _SEED_CSV)
    else:
        log.warning(
            "Seed CSV not found at %s — skipping course seeding. "
            "Run ``python scripts/seed_from_csv.py`` to seed manually.",
            _SEED_CSV,
        )

def check_db_health() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False