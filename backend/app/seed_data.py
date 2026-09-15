"""
seed_data.py
============
Streaming CSV-based course seeder for the JNTUA GPA Calculator.

Hierarchy seeded: Course → Regulation → CourseSemester → CourseSubject

CSV contract (courses_master.csv):
    course_code, course_name, regulation_code, semester_number,
    subject_code, subject_name, credits, aliases

All four insert phases run inside a single atomic transaction.
Each phase is idempotent:
  - Courses / Regulations / CourseSemesters: bulk INSERT of missing rows.
  - CourseSubjects: raw SQL with ON CONFLICT (course_semester_id, code) DO NOTHING,
    exploiting the existing `uq_semester_subject_code` unique constraint.
"""

from __future__ import annotations

import csv
import logging
import uuid
from collections import defaultdict
from pathlib import Path
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models import Course, CourseSemester, CourseSubject, Regulation

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def seed_from_csv(db: Session, csv_path: Path, *, dry_run: bool = False) -> dict[str, int]:
    """
    Parse *csv_path* and idempotently seed the course hierarchy.

    Parameters
    ----------
    db:
        An open SQLAlchemy Session.  The caller is responsible for
        committing or rolling back (wrap with ``get_db_context``).
    csv_path:
        Absolute path to the CSV master file.
    dry_run:
        If *True*, parse and validate the CSV but do **not** flush any
        writes to the database.

    Returns
    -------
    dict with keys ``courses``, ``regulations``, ``semesters``, ``subjects``
    indicating how many *new* rows were inserted in each phase.
    """
    rows = _parse_csv(csv_path)
    if not rows:
        log.warning("seed_from_csv: CSV file is empty — nothing to seed.")
        return {"courses": 0, "regulations": 0, "semesters": 0, "subjects": 0}

    log.info("seed_from_csv: parsed %d subject rows from %s", len(rows), csv_path.name)

    course_map, reg_map, sem_map, subject_payloads = _build_graph(rows)

    stats: dict[str, int] = {"courses": 0, "regulations": 0, "semesters": 0, "subjects": 0}

    if dry_run:
        log.info("seed_from_csv: DRY RUN — no database writes performed.")
        log.info(
            "  Would process: %d course(s), %d regulation(s), %d semester(s), %d subject(s)",
            len(course_map), len(reg_map), len(sem_map), len(subject_payloads),
        )
        return stats

    # ------------------------------------------------------------------ Phase 1: Courses
    stats["courses"] = _upsert_courses(db, course_map)

    # ------------------------------------------------------------------ Phase 2: Regulations
    stats["regulations"] = _upsert_regulations(db, reg_map, course_map)

    # ------------------------------------------------------------------ Phase 3: CourseSemesters
    stats["semesters"] = _upsert_semesters(db, sem_map, reg_map)

    # ------------------------------------------------------------------ Phase 4: CourseSubjects
    stats["subjects"] = _upsert_subjects(db, subject_payloads, sem_map)

    log.info(
        "seed_from_csv: inserted — courses=%d, regulations=%d, semesters=%d, subjects=%d",
        stats["courses"], stats["regulations"], stats["semesters"], stats["subjects"],
    )
    return stats


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_csv(csv_path: Path) -> list[dict[str, str]]:
    """Read and lightly validate the CSV; return a list of raw row dicts."""
    rows: list[dict[str, str]] = []
    required = {
        "course_code", "course_name", "regulation_code",
        "semester_number", "subject_code", "subject_name", "credits",
    }
    with csv_path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        if reader.fieldnames is None:
            raise ValueError(f"CSV file has no header row: {csv_path}")
        missing = required - set(reader.fieldnames)
        if missing:
            raise ValueError(
                f"CSV is missing required columns: {missing!r}  "
                f"(found: {list(reader.fieldnames)!r})"
            )
        for lineno, row in enumerate(reader, start=2):
            course_code = row["course_code"].strip()
            subject_code = row["subject_code"].strip()
            if not course_code or not subject_code:
                log.warning("seed_from_csv: skipping blank row at line %d", lineno)
                continue
            try:
                float(row["credits"])
            except ValueError:
                log.warning(
                    "seed_from_csv: invalid credits %r at line %d — skipping",
                    row["credits"], lineno,
                )
                continue
            rows.append(row)
    return rows


# ---------------------------------------------------------------------------
# Graph builder — single O(N) pass over all rows
# ---------------------------------------------------------------------------

# course_map:  course_code → {"name": str, "id": uuid | None}
# reg_map:     (course_code, reg_code) → {"id": uuid | None}
# sem_map:     (course_code, reg_code, sem_number) → {"id": uuid | None}
# subject_payloads: list of flat dicts ready for bulk INSERT

def _build_graph(rows: list[dict[str, str]]) -> tuple[
    dict[str, dict[str, Any]],
    dict[tuple, dict[str, Any]],
    dict[tuple, dict[str, Any]],
    list[dict[str, Any]],
]:
    course_map: dict[str, dict[str, Any]] = {}
    reg_map: dict[tuple, dict[str, Any]] = {}
    sem_map: dict[tuple, dict[str, Any]] = {}
    subject_payloads: list[dict[str, Any]] = []

    for row in rows:
        cc = row["course_code"].strip()
        cn = row["course_name"].strip()
        rc = row["regulation_code"].strip()
        sn = int(row["semester_number"].strip())
        sc = row["subject_code"].strip()
        sname = row["subject_name"].strip()
        credits = float(row["credits"].strip())
        aliases = row.get("aliases", "").strip() or None

        course_map.setdefault(cc, {"name": cn, "id": None})
        reg_map.setdefault((cc, rc), {"id": None})
        sem_map.setdefault((cc, rc, sn), {"id": None})
        subject_payloads.append({
            "_sem_key": (cc, rc, sn),
            "id": uuid.uuid4(),
            "code": sc,
            "name": sname,
            "credits": credits,
            "aliases": aliases,
        })

    return course_map, reg_map, sem_map, subject_payloads


# ---------------------------------------------------------------------------
# Phase 1 — Courses
# ---------------------------------------------------------------------------

def _upsert_courses(db: Session, course_map: dict[str, dict[str, Any]]) -> int:
    """
    Fetch all existing Course rows in one query, INSERT only missing codes.
    Populates course_map[code]["id"] for every entry.
    Returns the count of newly inserted rows.
    """
    existing: dict[str, uuid.UUID] = {
        c.code: c.id
        for c in db.query(Course.code, Course.id).all()
    }

    new_courses: list[Course] = []
    for code, meta in course_map.items():
        if code in existing:
            course_map[code]["id"] = existing[code]
        else:
            obj = Course(id=uuid.uuid4(), code=code, name=meta["name"])
            new_courses.append(obj)
            course_map[code]["id"] = obj.id

    if new_courses:
        db.bulk_save_objects(new_courses)
        db.flush()

    return len(new_courses)


# ---------------------------------------------------------------------------
# Phase 2 — Regulations
# ---------------------------------------------------------------------------

def _upsert_regulations(
    db: Session,
    reg_map: dict[tuple, dict[str, Any]],
    course_map: dict[str, dict[str, Any]],
) -> int:
    existing_ids: dict[tuple, uuid.UUID] = {
        (r.course_id, r.code): r.id
        for r in db.query(Regulation.course_id, Regulation.code, Regulation.id).all()
    }

    new_regs: list[Regulation] = []
    for (cc, rc), meta in reg_map.items():
        course_id: uuid.UUID = course_map[cc]["id"]  # type: ignore[assignment]
        lookup_key = (course_id, rc)
        if lookup_key in existing_ids:
            reg_map[(cc, rc)]["id"] = existing_ids[lookup_key]
        else:
            obj = Regulation(id=uuid.uuid4(), course_id=course_id, code=rc)
            new_regs.append(obj)
            reg_map[(cc, rc)]["id"] = obj.id

    if new_regs:
        db.bulk_save_objects(new_regs)
        db.flush()

    return len(new_regs)


# ---------------------------------------------------------------------------
# Phase 3 — CourseSemesters
# ---------------------------------------------------------------------------

def _upsert_semesters(
    db: Session,
    sem_map: dict[tuple, dict[str, Any]],
    reg_map: dict[tuple, dict[str, Any]],
) -> int:
    existing_ids: dict[tuple, uuid.UUID] = {
        (s.regulation_id, s.semester_number): s.id
        for s in db.query(
            CourseSemester.regulation_id,
            CourseSemester.semester_number,
            CourseSemester.id,
        ).all()
    }

    new_sems: list[CourseSemester] = []
    for (cc, rc, sn), meta in sem_map.items():
        reg_id: uuid.UUID = reg_map[(cc, rc)]["id"]  # type: ignore[assignment]
        lookup_key = (reg_id, sn)
        if lookup_key in existing_ids:
            sem_map[(cc, rc, sn)]["id"] = existing_ids[lookup_key]
        else:
            obj = CourseSemester(id=uuid.uuid4(), regulation_id=reg_id, semester_number=sn)
            new_sems.append(obj)
            sem_map[(cc, rc, sn)]["id"] = obj.id

    if new_sems:
        db.bulk_save_objects(new_sems)
        db.flush()

    return len(new_sems)


# ---------------------------------------------------------------------------
# Phase 4 — CourseSubjects (bulk raw SQL, ON CONFLICT DO NOTHING)
# ---------------------------------------------------------------------------

def _upsert_subjects(
    db: Session,
    subject_payloads: list[dict[str, Any]],
    sem_map: dict[tuple, dict[str, Any]],
) -> int:
    """
    Emit a single parameterised INSERT ... ON CONFLICT (course_semester_id, code)
    DO NOTHING, leveraging the existing `uq_semester_subject_code` constraint.

    PostgreSQL will silently skip rows that already exist — no SELECT required.
    Returns the server-reported row count of actually inserted rows.
    """
    if not subject_payloads:
        return 0

    # Resolve course_semester_id for every row now that sem_map is populated.
    resolved: list[dict[str, Any]] = []
    for payload in subject_payloads:
        sem_key = payload["_sem_key"]
        sem_id: uuid.UUID | None = sem_map[sem_key].get("id")
        if sem_id is None:
            log.warning(
                "seed_from_csv: could not resolve semester_id for key %s — skipping subject %s",
                sem_key, payload["code"],
            )
            continue
        resolved.append({
            "id": str(payload["id"]),
            "course_semester_id": str(sem_id),
            "code": payload["code"],
            "name": payload["name"],
            "credits": payload["credits"],
            "aliases": payload["aliases"],
        })

    if not resolved:
        return 0

    stmt = text(
        """
        INSERT INTO course_subjects (id, course_semester_id, code, name, credits, aliases)
        VALUES (:id, :course_semester_id, :code, :name, :credits, :aliases)
        ON CONFLICT (course_semester_id, code) DO NOTHING
        """
    )
    result = db.execute(stmt, resolved)
    db.flush()
    # rowcount reflects the number of rows actually inserted (conflicts excluded).
    return result.rowcount if result.rowcount >= 0 else len(resolved)