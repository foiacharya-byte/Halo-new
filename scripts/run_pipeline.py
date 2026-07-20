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
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROC = ROOT / "data" / "processed"
CHANGELOG = PROC / "CHANGELOG.md"

# (label, script, extra args)
STAGES = [
    ("extract areas", "scripts/extract/extract_areas.py", []),
    ("validate areas", "scripts/validate/validate_areas.py", []),
]

# validated dataset -> csv columns (order matters for humans)
CSV_EXPORTS = {
    "areas.validated.json": ("areas.csv",
        ["id", "name", "type", "parent_zone", "ward_number", "pin_codes",
         "confidence", "needs_review", "last_updated"]),
}


def run(label: str, script: str, extra: list[str]) -> bool:
    print(f"\n▶ {label}")
    res = subprocess.run([sys.executable, str(ROOT / script), *extra])
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
        counts[f.stem.replace(".validated", "")] = len(json.loads(f.read_text()))
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
    for label, script, extra in STAGES:
        run(label, script, extra + (args if "extract" in script else []))
    export_csvs()
    run("build index", "scripts/index/build_index.py", [])
    write_changelog(live, dataset_counts())
    print("\n✨ pipeline complete. Try: python3 scripts/query/ask.py \"tell me about Harni\"")


if __name__ == "__main__":
    main()
