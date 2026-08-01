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
        server_default="true",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    semesters: Mapped[list["Semester"]] = relationship(
        "Semester",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
        order_by="Semester.semester_number"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"

class Semester(Base):
    __tablename__ = "semesters"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "semester_number",
            name="uq_user_semester_number",
            comment="A user cannot have two rows for the same semester number.",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    semester_number: Mapped[int] = mapped_column(
        nullable=False,
        comment="1-indexed semester ordinal (1 = Sem 1, 8 = Sem 8).",
    )
    semester_label: Mapped[Optional[str]] = mapped_column(
        String(25), nullable=True,
        comment="Optional label e.g. '3rd Year/1st Sem'.",
    )
    subjects: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON, nullable=False, default=list,
        comment="JSONB array of {name, credits, grade} obejcts.",
    )
    sgpa: Mapped[float] = mapped_column(
        nullable=False, default=0.0,
        comment="Pre-computed SGPA.",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship("User", back_populates="semesters")

    def __repr__(self) -> str:
        return (f"<Semester user_id={self.user_id} "
                f"sem={self.semester_number} sgpa={self.sgpa:.2f}>")

# Grade Constants

GRADE_POINTS: dict[str, float | None] = {
    "S": 10.0,
    "A": 9.0,
    "B": 8.0,
    "C": 7.0,
    "D": 6.0,
    "E": 4.0,
    "F": 0.0,
    "Absent": 0.0,
    "Complete": None,
}
VALID_GRADES: frozenset[str] = frozenset(GRADE_POINTS.keys())

# Pydantic Schemas

class SubjectEntry(BaseModel):
    name: str = Field(..., min_length=1, max_length=75, examples=["Data Structures & Algorithms"])
    credits: float = Field(..., ge=0.0, le=5.0, 
                           description="Supports fractional credits (e.g. 1.5, 3.0).",
                           examples=[0.0, 1.5, 3.0])
    grade: str = Field(..., examples=["S", "A", "Complete"])

    @field_validator("grade")
    @classmethod
    def validate_grade(cls, v: str) -> str:
        normalised = v.strip()
        if normalised not in VALID_GRADES:
            raise ValueError(f"Invalid grade '{v}'. Allowed: {sorted(VALID_GRADES)}")
        return normalised

    @field_validator("credits")
    @classmethod
    def validate_credits(cls, v: float) -> float:
        return round(v, 1)

class SemesterCreate(BaseModel):
    semester_number: int = Field(..., ge=1, le=12)
    semester_label: Optional[str] = Field(None, max_length=25)
    subjects: list[SubjectEntry] = Field(..., min_length=1)

class SemesterUpdate(BaseModel):
    semester_label: Optional[str] = Field(None, max_length=25)
    subjects: Optional[list[SubjectEntry]] = None

class SemesterResponse(BaseModel):
    id: uuid.UUID
    semester_number: int
    semester_label: Optional[str]
    subjects: list[SubjectEntry]
    sgpa: float
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str]
    picture_url: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}

class GoogleAuthRequest(BaseModel):
    credential: str = Field(..., description="Google ID token (JWT) from google.")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class CgpaResponse(BaseModel):
    cgpa: float
    total_semesters: int
    semester_sgpas: list[dict[str, Any]]

def compute_sgpa(subjects: list[SubjectEntry]) -> float:
    numerator: float = 0.0
    denominator: float = 0.0

    for subject in subjects:
        grade_value = GRADE_POINTS[subject.grade]
        if grade_value is None:
            continue
        denominator += subject.credits
        numerator += subject.credits * grade_value

    if denominator == 0.0:
        return 0.0
    return round(numerator / denominator, 2)

def compute_cgpa(sgpa_list: list[float]) -> float:
    if not sgpa_list:
        return 0.0
    return round(sum(sgpa_list) / len(sgpa_list), 2)