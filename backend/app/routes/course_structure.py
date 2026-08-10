from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Course, Regulation, CourseSemester, CourseSubject,
    CourseOut, RegulationOut, CourseSubjectOut, User,
)
from app.routes.auth import get_current_user

router = APIRouter(prefix="/course-structure", tags=["Course Structure"])

def _get_course_or_404(code: str, db: Session) -> Course:
    course = db.execute(select(Course).where(Course.code == code.upper())).scalar_one_or_none()
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Course '{code}' not found.")
    return course

def _get_regulation_or_404(course: Course, reg_code: str, db: Session) -> Regulation:
    regulation = db.execute(
        select(Regulation).where(Regulation.course_id == course.id, Regulation.code == reg_code.upper())
    ).scalar_one_or_none()
    if regulation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Regulation '{reg_code}' not found for {course.code}.")
    return regulation

def _get_course_semester_or_404(regulation: Regulation, semester_number: int, db: Session) -> CourseSemester:
    course_semester = db.execute(
        select(CourseSemester).where(
            CourseSemester.regulation_id == regulation.id,
            CourseSemester.semester_number == semester_number,
        )
    ).scalar_one_or_none()
    if course_semester is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Semester {semester_number} not found for {regulation.code}.")
    return course_semester

@router.get("/courses", response_model=list[CourseOut], summary="List all courses/departments")
def list_courses(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CourseOut]:
    courses = db.execute(select(Course).order_by(Course.code)).scalars().all()
    return [CourseOut.model_validate(c) for c in courses]

@router.get("/{course}/regulations", response_model=list[RegulationOut], summary="List regulations for a course")
def list_regulations(
    course: str,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[RegulationOut]:
    course_row = _get_course_or_404(course, db)
    regulations = db.execute(
        select(Regulation).where(Regulation.course_id == course_row.id).order_by(Regulation.code.desc())
    ).scalars().all()
    return [RegulationOut.model_validate(r) for r in regulations]

@router.get("/{course}/{regulation}/semesters", response_model=list[int], summary="List semester numbers")
def list_semesters(
    course: str,
    regulation: str,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[int]:
    course_row = _get_course_or_404(course, db)
    regulation_row = _get_regulation_or_404(course_row, regulation, db)
    rows = db.execute(
        select(CourseSemester.semester_number)
        .where(CourseSemester.regulation_id == regulation_row.id)
        .order_by(CourseSemester.semester_number)
    ).all()
    return [r[0] for r in rows]

@router.get(
    "/{course}/{regulation}/{semester}/subjects",
    response_model=list[CourseSubjectOut],
    summary="List subjects for a course/regulation/semester",
)
def list_subjects(
    course: str,
    regulation: str,
    semester: int,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CourseSubjectOut]:
    course_row = _get_course_or_404(course, db)
    regulation_row = _get_regulation_or_404(course_row, regulation, db)
    course_semester_row = _get_course_semester_or_404(regulation_row, semester, db)
    subjects = db.execute(
        select(CourseSubject)
        .where(CourseSubject.course_semester_id == course_semester_row.id)
        .order_by(CourseSubject.code)
    ).scalars().all()
    return [CourseSubjectOut.model_validate(s) for s in subjects]

@router.get(
    "/{course}/{regulation}/{semester}/subjects/search",
    response_model=list[CourseSubjectOut],
    summary="Search subjects by name, code, or alias (autocomplete)",
)
def search_subjects(
    course: str,
    regulation: str,
    semester: int,
    q: str = Query(..., min_length=1, max_length=50),
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CourseSubjectOut]:
    course_row = _get_course_or_404(course, db)
    regulation_row = _get_regulation_or_404(course_row, regulation, db)
    course_semester_row = _get_course_semester_or_404(regulation_row, semester, db)
    like = f"%{q.lower()}%"
    subjects = db.execute(
        select(CourseSubject)
        .where(
            CourseSubject.course_semester_id == course_semester_row.id,
            or_(
                func.lower(CourseSubject.name).like(like),
                func.lower(CourseSubject.code).like(like),
                func.lower(CourseSubject.aliases).like(like),
            ),
        )
        .order_by(CourseSubject.code)
    ).scalars().all()
    return [CourseSubjectOut.model_validate(s) for s in subjects]