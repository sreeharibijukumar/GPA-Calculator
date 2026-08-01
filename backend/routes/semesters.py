import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Path

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import (
    CgpaResponse,
    Semester,
    SemesterCreate,
    SemesterUpdate,
    SemesterResponse,
    SubjectEntry,
    User,
    compute_cgpa,
    compute_sgpa,
)
from app.routes.auth import get_current_user

router = APIRouter(prefix="/semesters", tags=["Semesters"])

def _get_semester_or_404(semester_id: uuid.UUID, user_id: uuid.UUID, db: Session) -> Semester:
    stmt = select(Semester).where(
        Semester.id == semester_id,
        Semester.user_id == user_id,
    )
    semester = db.execute(stmt).scalar_one_or_none()
    if semester is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Semester {semester_id} not found.",
        )
    return semester

def _subjects_to_dicts(subjects: list[SubjectEntry]) -> list[dict[str, Any]]:
    return [s.model_dump() for s in subjects]

@router.post("/calculate", response_model=dict, status_code=200, summary="Calculate SGPA without saving")
def calculate_sgpa(body: SemesterCreate) -> dict:
    subjects = body.subjects
    effective_credits = sum(s.credits for s in subjects if s.grade != "Complete")
    total_credits = sum(s.credits for s in subjects)
    sgpa = compute_sgpa(subjects)
    return {
        "sgpa": sgpa,
        "total_credits": round(total_credits, 1),
        "effective_credits": round(effective_credits, 1),
        "subject_count": len(subjects),
    }

@router.get("/cgpa", response_model=CgpaResponse, summary="Get CGPA")
def get_cgpa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CgpaResponse:
    stmt = (
        select(Semester.semester_number, Semester.sgpa, Semester.semester_label)
        .where(Semester.user_id == current_user.id)
        .order_by(Semester.semester_number)
    )
    rows = db.execute(stmt).all()
    sgpa_list = [row.sgpa for row in rows]
    return CgpaResponse(
        cgpa=compute_cgpa(sgpa_list),
        total_semesters=len(rows),
        semester_sgpas=[
            {"semester_number": r.semester_number,
             "semester_label": r.semester_label,
             "sgpa": r.sgpa}
            for r in rows
        ],
    )

@router.post("", response_model=SemesterResponse, status_code=201, summary="Create a new semester")
def create_semester(
    body: SemesterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SemesterResponse:
    sgpa = compute_sgpa(body.subjects)
    semester = Semester(
        user_id=current_user.id,
        semester_number=body.semester_number,
        semester_label=body.semester_label,
        subjects=_subjects_to_dicts(body.subjects),
        sgpa=sgpa,
    )
    db.add(semester)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"Semester {body.semester_number} already exists.",
        )
    db.refresh(semester)
    return SemesterResponse.model_validate(semester)

@router.get("", response_model=list[SemesterResponse], summary="List all semesters")
def list_semesters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[SemesterResponse]:
    stmt = (
        select(Semester)
        .where(Semester.user_id == current_user.id)
        .order_by(Semester.semester_number)
    )
    semesters = db.execute(stmt).scalars().all()
    return [SemesterResponse.model_validate(s) for s in semesters]

@router.get("/{semester_id}", response_model=SemesterResponse, summary="Get a specific semester")
def get_semester(
    semester_id: uuid.UUID = Path(..., description="Semester UUID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SemesterResponse:
    semester = _get_semester_or_404(semester_id, current_user.id, db)
    return SemesterResponse.model_validate(semester)

@router.patch("/{semester_id}", response_model=SemesterResponse, summary="Update a specific semester")
def update_semester(
    body: SemesterUpdate,
    semester_id: uuid.UUID = Path(..., description="Semester UUID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SemesterResponse:
    semester = _get_semester_or_404(semester_id, current_user.id, db)
    if body.semester_label is not None:
        semester.semester_label = body.semester_label
    if body.subjects is not None:
        semester.subjects = _subjects_to_dicts(body.subjects)
        semester.sgpa = compute_sgpa(body.subjects)
    db.flush()
    db.refresh(semester)
    return SemesterResponse.model_validate(semester)

@router.delete("/{semester_id}", status_code=204, summary="Delete a semester")
def delete_semester(
    semester_id: uuid.UUID = Path(..., description="Semester UUID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    semester = _get_semester_or_404(semester_id, current_user.id, db)
    db.delete(semester)
    db.flush()
    return None