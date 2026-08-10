import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

from sqlalchemy import (
    Boolean, DateTime, Float, ForeignKey,
    String, Text, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
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

    full_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    picture_url: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True,
        comment="Google profile photo URL; refreshed on every login."
    )

    ht_number: Mapped[Optional[str]] = mapped_column(
        String(20), unique=True, nullable=True,
        comment="Hall Ticket / Roll Number."
    )

    department: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True,
        comment="Course/Department."
    )

    regulation: Mapped[Optional[str]] = mapped_column(
        String(5), nullable=True,
        comment="Regulation code, e.g. 'R23'."
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
        ForeignKey("users.id", ondelete="CASCADE"),
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
        JSONB, nullable=False, default=list,
        comment="JSONB array of {code, name, mark, credits, grade} objects.",
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

# Course structure Master Data
# Hierarchy: Course → Regulation → CourseSemester → CourseSubject

class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    code: Mapped[str] = mapped_column(
        String(15), unique=True, nullable=False, index=True, comment="e.g. 'CSE'"
    )
    name: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="e.g. 'Computer Science and Engineering'"
    )
    regulations: Mapped[list["Regulation"]] = relationship(
        "Regulation", back_populates="course", cascade="all, delete-orphan",
    )

class Regulation(Base):
    __tablename__ = "regulations"
    __table_args__ = (UniqueConstraint("course_id", "code", name="uq_course_regulation"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    code: Mapped[str] = mapped_column(
        String(10), nullable=False, comment="e.g. 'R23'"
    )
    course: Mapped["Course"] = relationship("Course", back_populates="regulations")
    semesters: Mapped[list["CourseSemester"]] = relationship(
        "CourseSemester", back_populates="regulation", cascade="all, delete-orphan",
    )

class CourseSemester(Base):
    __tablename__ = "course_semesters"
    __table_args__ = (UniqueConstraint("regulation_id", "semester_number", name="uq_regulation_semester"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    regulation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("regulations.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    semester_number: Mapped[int] = mapped_column(nullable=False)
    regulation: Mapped["Regulation"] = relationship("Regulation", back_populates="semesters")
    subjects: Mapped[list["CourseSubject"]] = relationship(
        "CourseSubject", back_populates="course_semester",
        cascade="all, delete-orphan",
    )

class CourseSubject(Base):
    __tablename__ = "course_subjects"
    __table_args__ = (UniqueConstraint("course_semester_id", "code", name="uq_semester_subject_code"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    course_semester_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_semesters.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    code: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="e.g. '23A5220T'"
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    credits: Mapped[float] = mapped_column(Float, nullable=False)
    aliases: Mapped[Optional[str]] = mapped_column(
        String(120), nullable=True,
        comment="Comma-separated search aliases, e.g. 'DBMS' for Database Management Systems.",
    )
    course_semester: Mapped["CourseSemester"] = relationship("CourseSemester", back_populates="subjects")

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

MARK_GRADE_BANDS: list[tuple[float, str]] = [
    (90.0, "S"), (80.0, "A"), (70.0, "B"), (60.0, "C"), (50.0, "D"), (40.0, "E"),
]

def grade_for_marks(mark: float) -> str:
    """Map a 0-100 mark to its JNTUA letter grade. <40 is F (fail)."""
    for threshold, grade in MARK_GRADE_BANDS:
        if mark >= threshold:
            return grade
    return "F"

# Pydantic Schemas

class SubjectEntry(BaseModel):
    name: str = Field(..., min_length=1, max_length=75, examples=["Data Structures & Algorithms"])
    credits: float = Field(..., ge=0.0, le=5.0, 
                           description="Supports fractional credits (e.g. 1.5, 3.0).",
                           examples=[0.0, 1.5, 3.0])
    grade: str = Field(..., examples=["S", "A", "Complete"])
    code: Optional[str] = Field(None, max_length=20, description="Course-structure subject code, if selected from autocomplete.")
    mark: Optional[float] = Field(None, ge=0.0, le=100.0, description="Marks scored out of 100")

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
    ht_number: Optional[str] = None
    department: Optional[str] = None
    regulation: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=50)
    ht_number: Optional[str] = Field(None, min_length=3, max_length=20)
    department: Optional[str] = Field(None, min_length=1, max_length=5)
    regulation: Optional[str] = Field(None, min_length=1, max_length=5)

    @field_validator("ht_number")
    @classmethod
    def validate_ht_number(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        cleaned = v.strip().upper()
        if not cleaned.replace("-", "").isalnum():
            raise ValueError("Hall ticket number must be alphanumeric.")
        return cleaned

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

class CourseOut(BaseModel):
    code: str
    name: str
    model_config = {"from_attributes": True}

class RegulationOut(BaseModel):
    code: str
    model_config = {"from_attributes": True}

class CourseSubjectOut(BaseModel):
    code: str
    name: str
    credits: float
    model_config = {"from_attributes": True}

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