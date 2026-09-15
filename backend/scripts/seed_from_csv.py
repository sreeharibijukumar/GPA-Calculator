#!/usr/bin/env python
"""
scripts/seed_from_csv.py
========================
CLI runner for the CSV-based course seeder.

Usage (run from the ``backend/`` directory):
    python scripts/seed_from_csv.py
    python scripts/seed_from_csv.py --file app/data/courses_master.csv
    python scripts/seed_from_csv.py --file /path/to/custom.csv --dry-run

Exit codes
----------
    0  Success (or dry-run completed cleanly).
    1  Error (CSV not found, parse failure, DB error).

Deployment hooks (Render / Docker)
-----------------------------------
Add to your render.yaml ``buildCommand`` or Dockerfile RUN step:
    python scripts/seed_from_csv.py --file app/data/courses_master.csv
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Ensure ``backend/`` is on sys.path so ``app.*`` imports resolve when the
# script is invoked directly (e.g. ``python scripts/seed_from_csv.py``).
# ---------------------------------------------------------------------------
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

# Default CSV path relative to backend/
_DEFAULT_CSV = _BACKEND_ROOT / "app" / "data" / "courses_master.csv"


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Idempotently seed course hierarchy from a CSV master file.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--file",
        type=Path,
        default=_DEFAULT_CSV,
        metavar="PATH",
        help=(
            f"Path to the courses CSV file "
            f"(default: {_DEFAULT_CSV.relative_to(_BACKEND_ROOT)})"
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Parse and validate the CSV, print statistics, but do NOT commit any writes.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """
    Entry point.  Returns 0 on success, 1 on any error.
    Suitable for use as a Docker/Render deployment hook.
    """
    _configure_logging()
    log = logging.getLogger("seed_from_csv")
    args = _parse_args(argv)

    csv_path: Path = args.file.resolve()
    dry_run: bool = args.dry_run

    # ------------------------------------------------------------------ pre-flight
    if not csv_path.exists():
        log.error("CSV file not found: %s", csv_path)
        return 1
    if not csv_path.is_file():
        log.error("Path is not a regular file: %s", csv_path)
        return 1

    log.info("CSV path  : %s", csv_path)
    log.info("Dry run   : %s", dry_run)

    # ------------------------------------------------------------------ env / DB
    try:
        # Lazy imports: dotenv + SQLAlchemy engine are only needed at runtime.
        from dotenv import load_dotenv
        load_dotenv(_BACKEND_ROOT / ".env")

        from app.database import get_db_context
        from app.seed_data import seed_from_csv
    except ImportError as exc:
        log.error("Import error — are you running from the backend/ directory? %s", exc)
        return 1

    # ------------------------------------------------------------------ seed
    try:
        with get_db_context() as db:
            stats = seed_from_csv(db, csv_path, dry_run=dry_run)

        if dry_run:
            log.info("Dry-run complete — no changes committed.")
        else:
            log.info(
                "Seeding complete: "
                "courses=+%d  regulations=+%d  semesters=+%d  subjects=+%d",
                stats["courses"],
                stats["regulations"],
                stats["semesters"],
                stats["subjects"],
            )
    except Exception as exc:  # noqa: BLE001
        log.exception("Seeding failed: %s", exc)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
