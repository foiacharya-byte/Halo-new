#!/usr/bin/env python3
"""
Phase 3 — validate TRIP_SPOTS: dedupe by name, keep nearest coordinate, sort.

Reads:  data/processed/trip_spots.json
Writes: data/processed/trip_spots.validated.json, data/processed/trips.report.md
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from halo.util import norm_name, now_iso  # noqa: E402

TRIPS = ROOT / "data" / "processed" / "trip_spots.json"
OUT = ROOT / "data" / "processed" / "trip_spots.validated.json"
REPORT = ROOT / "data" / "processed" / "trips.report.md"


def main() -> None:
    spots = json.loads(TRIPS.read_text(encoding="utf-8"))
    by_key: dict[str, dict] = {}
    for s in spots:
        k = norm_name(s["name"])
        if k in by_key:
            cur = by_key[k]
            cur["source_links"] = sorted(set(cur["source_links"]) | set(s["source_links"]))
            cur["best_for_mood"] = sorted(set(cur["best_for_mood"]) | set(s["best_for_mood"]))
            if (s.get("distance_km") or 1e9) < (cur.get("distance_km") or 1e9):
                cur["distance_km"] = s["distance_km"]
        else:
            by_key[k] = dict(s)
    out = sorted(by_key.values(), key=lambda s: s.get("distance_km") or 1e9)
    for s in out:
        s["last_updated"] = now_iso()

    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = ["# Trip spots — validation report", f"_Generated {now_iso()}_", "",
             f"- raw: **{len(spots)}**  ·  after dedupe: **{len(out)}**", "",
             "| km | type | moods | name |", "|---|---|---|---|"]
    for s in out:
        lines.append(f"| {s.get('distance_km')} | {s.get('type')} | "
                     f"{', '.join(s.get('best_for_mood', []))} | {s['name']}"
                     f"{' 🧪' if s.get('is_demo') else ''} |")
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[validate-trips] {len(spots)} -> {len(out)} -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
