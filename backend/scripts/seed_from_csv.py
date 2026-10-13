from __future__ import annotations
import argparse, logging, sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

_DEFAULT_CSV = _BACKEND_ROOT / "app" / "data" / "courses_master.csv"

def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Seed JNTUA course structure.")
    p.add_argument("--csv", type=Path, default=_DEFAULT_CSV)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args(argv)

    logging.basicConfig(level=logging.INFO)
    from app.database import Base, engine, get_db_context
    from app import models  # noqa: F401
    from app.seed_data import seed_from_csv

    Base.metadata.create_all(bind=engine)
    with get_db_context() as db:
        stats = seed_from_csv(db, args.csv, dry_run=args.dry_run)
    print("Result:", stats)
    return 0

if __name__ == "__main__":
    sys.exit(main())