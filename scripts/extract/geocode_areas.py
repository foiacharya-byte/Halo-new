#!/usr/bin/env python3
"""
Phase 2b — back-fill AREA coordinates so "near me" search works.

For each locality/village in areas.validated.json that has no coordinates:
  * LIVE (allow_network=true): geocode via OSM Nominatim (reusing
    services_osm.geocode). Fills coordinates + coordinates_source="openstreetmap".
    A single miss is SKIPPED and logged; we keep going. The ledger gets ONE
    aggregate status (usable/partial/blocked) — same resilient rule as services.
  * SANDBOX (allow_network=false): fills from the labelled demo-coords fixture
    (coordinates_source="demo_fixture"), so near-me is demonstrable offline.
    These are approximate and flagged; a live run replaces them.

Honesty: real coordinates are never guessed — live coords come from OSM; demo
coords are clearly marked demo_fixture and keep needs_review=true.

Writes back into data/processed/areas.validated.json (idempotent: only fills
records that are still missing coordinates unless --refresh).

  python3 scripts/extract/geocode_areas.py             # demo coords (sandbox)
  HALO_ALLOW_NETWORK=1 python3 scripts/extract/geocode_areas.py   # real OSM
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import config, provenance          # noqa: E402
from halo.util import now_iso                 # noqa: E402

AREAS = ROOT / "data" / "processed" / "areas.validated.json"
DEMO = ROOT / "data" / "seed" / "area_coords_demo.json"


def fill_from_demo(areas: list[dict]) -> int:
    coords = json.loads(DEMO.read_text(encoding="utf-8"))["coords"]
    filled = 0
    for a in areas:
        names = [a["name"], *a.get("aliases", [])]
        hit = next((coords[n] for n in names if n in coords), None)
        if hit and not a.get("coordinates"):
            a["coordinates"] = {"lat": hit[0], "lon": hit[1]}
            a["coordinates_source"] = "demo_fixture"
            a["last_updated"] = now_iso()
            filled += 1
    provenance.record("src.osm.nominatim", "fixture",
                      f"filled {filled} area coords from demo fixture (approximate)",
                      records=filled)
    print(f"[geocode] demo fixture filled {filled} areas")
    return filled


def fill_from_osm(areas: list[dict], refresh: bool) -> int:
    from scripts.extract.services_osm import geocode, blocked_hint  # reuse the OSM client
    targets = [a for a in areas if refresh or not a.get("coordinates")]
    ok = empty = error = 0
    for a in targets:
        coords, status = geocode(a["name"])   # geocode() prints the precise reason
        if status == "ok":
            a["coordinates"] = {"lat": coords[0], "lon": coords[1]}
            a["coordinates_source"] = "openstreetmap"
            a["last_updated"] = now_iso()
            ok += 1
        elif status == "empty":
            empty += 1
        else:
            error += 1

    total = len(targets)
    if ok > 0:
        agg = "usable" if (empty == 0 and error == 0) else "partial"
    elif error > 0:
        agg = "blocked"
    else:
        agg = "partial"
    provenance.record("src.osm.nominatim", agg,
                      f"{ok}/{total} areas geocoded (empty={empty}, errors={error})",
                      records=ok)
    print(f"[geocode] OSM aggregate: {agg} — {ok}/{total} geocoded")
    if agg == "blocked":
        blocked_hint()
    return ok


def main() -> None:
    ap = argparse.ArgumentParser(description="Back-fill AREA coordinates.")
    ap.add_argument("--refresh", action="store_true", help="re-geocode even if coords exist")
    ap.add_argument("--live", action="store_true",
                    help="accepted for pipeline symmetry; live vs demo is decided by "
                         "the network switch (allow_network / HALO_ALLOW_NETWORK)")
    args = ap.parse_args()

    if not AREAS.exists():
        sys.exit("Run the areas extractor + validator first.")
    areas = json.loads(AREAS.read_text(encoding="utf-8"))

    if config.network_allowed():
        fill_from_osm(areas, args.refresh)
    else:
        fill_from_demo(areas)

    AREAS.write_text(json.dumps(areas, indent=2, ensure_ascii=False), encoding="utf-8")
    with_coords = sum(1 for a in areas if a.get("coordinates"))
    print(f"[geocode] {with_coords}/{len(areas)} areas now have coordinates "
          f"-> {AREAS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
