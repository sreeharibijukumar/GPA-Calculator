import os
from contextlib import contextmanager
from typing import Generator
from dotenv import load_dotenv

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import QueuePool

load_dotenv()

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

def init_db() -> None:
    # Called once during FastAPI's lifespan startup event.
    # Safe to call repeatedly — create_all() is idempotent.
    from app import models
    Base.metadata.create_all(bind=engine)

def check_db_health() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False