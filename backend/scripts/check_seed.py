"""Compare course_subjects in the DB against courses_master.csv."""
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))

from sqlalchemy import text
from app.database import get_db_context
from app.seed_data import _parse_csv

CSV = _ROOT / "app" / "data" / "courses_master.csv"

def main() -> int:
    rows = _parse_csv(CSV)
    expected = {
        (r["course_code"].strip(), r["regulation_code"].strip(),
         int(r["semester_number"]), r["subject_code"].strip())
        for r in rows
    }
    with get_db_context() as db:
        found = set(db.execute(text("""
            SELECT c.code, r.code, cs.semester_number, s.code
            FROM course_subjects s
            JOIN course_semesters cs ON cs.id = s.course_semester_id
            JOIN regulations r ON r.id = cs.regulation_id
            JOIN courses c ON c.id = r.course_id
        """)).all())

    missing = expected - found
    extra = found - expected
    print(f"CSV subjects : {len(expected)}")
    print(f"DB subjects  : {len(found)}")
    print(f"Missing in DB: {len(missing)}")
    print(f"Not in CSV   : {len(extra)}")
    for m in sorted(missing)[:20]:
        print("  missing:", m)
    return 0 if not missing else 1

if __name__ == "__main__":
    sys.exit(main())
