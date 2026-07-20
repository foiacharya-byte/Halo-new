#!/usr/bin/env python3
"""
Phase 2 extractor — TRIP_SPOTS (temples, forts, dams, hills, parks within ~60 km).

  live OSM (trips_osm)  [--live]  ->  real spots + distance/coords/mood
  else -> labelled demo fixture (is_demo=true)

  python3 scripts/extract/extract_trips.py            # demo
  python3 scripts/extract/extract_trips.py --live      # real OSM
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import provenance                       # noqa: E402
from halo.models import TripSpot                    # noqa: E402
from halo.util import make_id, now_iso              # noqa: E402

OUT = ROOT / "data" / "processed" / "trip_spots.json"
DEMO = ROOT / "data" / "seed" / "trips_demo.json"


def to_spot(raw: dict) -> dict:
    t = TripSpot(
        name=raw["name"],
        distance_km=raw.get("distance_km"),
        type=raw.get("type", "attraction"),
        best_for_mood=raw.get("best_for_mood", []),
        description_summary=raw.get("description", ""),
        how_to_reach=raw.get("how_to_reach", ""),
        source_links=[raw["source_link"]] if raw.get("source_link") else [],
        source_ids=["src.osm.trips"] if not raw.get("is_demo") else ["src.seed.curated"],
        confidence=0.5 if not raw.get("is_demo") else 0.3,
        needs_review=True,
    )
    d = t.to_dict()
    d["coordinates"] = raw.get("coordinates")
    d["is_demo"] = bool(raw.get("is_demo", False))
    d["id"] = make_id("trip", raw["name"], "vadodara")
    return d


def main() -> None:
    ap = argparse.ArgumentParser(description="Extract Vadodara TRIP SPOTS.")
    ap.add_argument("--live", action="store_true")
    args = ap.parse_args()

    raw: list[dict] = []
    if args.live:
        from scripts.extract.trips_osm import fetch_trip_spots
        raw = fetch_trip_spots()
    if not raw:
        recs = json.loads(DEMO.read_text(encoding="utf-8"))["records"]
        raw = [{**r, "is_demo": True} for r in recs]
        provenance.record("src.osm.trips", "fixture",
                          f"served {len(raw)} demo trip spots", records=len(raw))
        print(f"[trips] {len(raw)} via labelled demo fixture")

    spots = [to_spot(r) for r in raw]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(spots, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[trips] wrote {len(spots)} spots "
          f"({sum(s['is_demo'] for s in spots)} demo) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
