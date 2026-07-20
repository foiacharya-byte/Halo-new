#!/usr/bin/env python3
"""
Phase 6 — run the whole pipeline and record a change-log entry.

Order: extract -> validate -> export CSV -> build index -> changelog.
Each stage is a subprocess so one failing source can't crash the rest.
Pass --live to let extractors hit permitted sources; default is offline seed.

  python3 scripts/run_pipeline.py            # offline (committed seed)
  python3 scripts/run_pipeline.py --live     # refresh from permitted sources
"""
from __future__ import annotations

import csv
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

# Windows defaults to cp1252 for file IO + console; force UTF-8 so reading the
# (UTF-8) datasets and printing emoji never crashes. PYTHONUTF8 propagates to
# every child stage too.
os.environ.setdefault("PYTHONUTF8", "1")
os.environ.setdefault("PYTHONIOENCODING", "utf-8")
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:  # noqa: BLE001
        pass

ROOT = Path(__file__).resolve().parents[1]
PROC = ROOT / "data" / "processed"
CHANGELOG = PROC / "CHANGELOG.md"

# (label, script, extra args)
STAGES = [
    ("extract areas", "scripts/extract/extract_areas.py", []),
    ("validate areas", "scripts/validate/validate_areas.py", []),
    ("geocode areas", "scripts/extract/geocode_areas.py", []),
    ("extract services", "scripts/extract/extract_services.py", []),
    ("validate services", "scripts/validate/validate_services.py", []),
    ("extract news", "scripts/extract/extract_news.py", []),
    ("validate news", "scripts/validate/validate_news.py", []),
]

# validated dataset -> csv columns (order matters for humans)
CSV_EXPORTS = {
    "areas.validated.json": ("areas.csv",
        ["id", "name", "type", "taluka", "zone_group", "pin_codes", "aliases",
         "status", "confidence", "needs_review", "coordinates_source",
         "source_ids", "last_updated"]),
    "services.validated.json": ("services.csv",
        ["id", "name", "category", "locality", "rating_score", "rating_count",
         "halo_rating", "halo_five_star", "permanently_closed", "contact_consent",
         "is_demo", "source_platforms", "last_seen"]),
    "news_events.validated.json": ("news_events.csv",
        ["id", "date", "status", "tags", "locations_involved", "sentiment",
         "is_demo", "source_ids", "title", "last_updated"]),
}


def run(label: str, script: str, extra: list[str]) -> bool:
    print(f"\n▶ {label}")
    res = subprocess.run([sys.executable, str(ROOT / script), *extra], env=os.environ)
    ok = res.returncode == 0
    print(("✅" if ok else "❌") + f" {label}")
    return ok


def export_csvs() -> list[str]:
    written = []
    for src, (out, cols) in CSV_EXPORTS.items():
        p = PROC / src
        if not p.exists():
            continue
        rows = json.loads(p.read_text(encoding="utf-8"))
        with (PROC / out).open("w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(cols)
            for r in rows:
                w.writerow([
                    "; ".join(v) if isinstance((v := r.get(c, "")), list) else v
                    for c in cols
                ])
        written.append(out)
        print(f"📄 exported {out} ({len(rows)} rows)")
    return written


def dataset_counts() -> dict[str, int]:
    counts = {}
    for f in sorted(PROC.glob("*.validated.json")):
        counts[f.stem.replace(".validated", "")] = len(
            json.loads(f.read_text(encoding="utf-8")))
    return counts


def write_changelog(live: bool, counts: dict[str, int]) -> None:
    stamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    mode = "live" if live else "seed"
    summary = ", ".join(f"{k}={v}" for k, v in counts.items()) or "no datasets"
    entry = f"- **{stamp}** · mode=`{mode}` · {summary}\n"
    header = "# Halo data — change log\n\n_Newest first._\n\n"
    prev = ""
    if CHANGELOG.exists():
        text = CHANGELOG.read_text(encoding="utf-8")
        prev = text.split("_Newest first._\n\n", 1)[-1] if "_Newest first._" in text else text
    CHANGELOG.write_text(header + entry + prev, encoding="utf-8")
    print(f"\n🗒  changelog updated: {summary}")


def main() -> None:
    live = "--live" in sys.argv
    args = ["--live"] if live else []

    # fresh source ledger each run, so source_status reflects THIS run's reality
    ledger = PROC / "source_status.json"
    if ledger.exists():
        ledger.unlink()

    for label, script, extra in STAGES:
        run(label, script, extra + (args if "extract" in script else []))
    export_csvs()
    run("build index", "scripts/index/build_index.py", [])

    # honest source-status report (usable / partial / blocked / network_disabled / fixture)
    sys.path.insert(0, str(ROOT))
    from halo import provenance  # noqa: E402
    (PROC / "source_status.md").write_text(provenance.render_markdown(), encoding="utf-8")
    print("🧭 source status -> data/processed/source_status.md")

    write_changelog(live, dataset_counts())
    print("\n✨ pipeline complete. Try: python3 scripts/query/ask.py \"what floods happened in Sama\"")


if __name__ == "__main__":
    main()
