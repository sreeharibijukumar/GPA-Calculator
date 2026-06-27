import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

from sqlalchemy import (
    Boolean, DateTime, ForeignKey,
    String, Text, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Internal surrogate key (UUID v4)."
    )

    google_id: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        nullable=False,
        index=True,
        comment="Google OAuth2 'sub' claim — immutable user identifier."
    )

    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        nullable=False,
        index=True
    )

    full_name: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)

    picture_url: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True,
        comment="Google profile photo URL; refreshed on every login."
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        sever_default="true",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        sever_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        sever_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    semesters: Mapped[list["Semester"]] = relationship(
        "Semester",
        back_poplutates="user",
        cascade="all, delete-orphan",
        lazy="select",
        order_by="Semester.semester_number"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"

