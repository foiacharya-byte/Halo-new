#!/usr/bin/env python3
"""
Phase 2 extractor — AREAS (wards / localities / villages of Vadodara).

Modes:
  * default (offline): build from the curated lists in vadodara_places.py — real
    Vadodara place names, attributed to src.seed.curated, status
    single_source_needs_review, pending corroboration.
  * --live: additionally parse the Census 2011 city ward table (robots-respecting)
    and merge. Best-effort; a shape change just yields the seed + a log line.

HONESTY (unchanged, and now enforced by status):
  * pin_codes / zone_group are INDICATIVE until India Post / VMC verify them.
  * taluka is set only where confident (city localities -> Vadodara).
  * coordinates are NEVER guessed (left null; geocode from OpenStreetMap later).
  * provenance is real: curated names carry src.seed.curated, NOT a directory we
    have not actually fetched. Directory/census attribution is added only by the
    live extractor when it truly pulls a record.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo.models import Area          # noqa: E402
from halo.util import make_id, now_iso  # noqa: E402
from scripts.extract.vadodara_places import CITY_LOCALITIES, VILLAGES  # noqa: E402

OUT = ROOT / "data" / "processed" / "areas.json"
SEED_SRC = "src.seed.curated"


def build_seed() -> list[dict]:
    records: list[dict] = []
    for name, zone, pins, aliases in CITY_LOCALITIES:
        a = Area(
            name=name, type="locality", taluka="Vadodara",
            zone_group=zone, pin_codes=pins, aliases=aliases, coordinates=None,
            source_ids=[SEED_SRC], source_links=[],
            confidence=0.4, needs_review=True,
            status="single_source_needs_review",
        )
        a.id = make_id("area", name, "vadodara")
        records.append(a.to_dict())
    for name, taluka, aliases in VILLAGES:
        a = Area(
            name=name, type="village", taluka=taluka,
            zone_group=None, pin_codes=[], aliases=aliases, coordinates=None,
            source_ids=[SEED_SRC], source_links=[],
            confidence=0.4, needs_review=True,
            status="single_source_needs_review",
        )
        a.id = make_id("area", name, "vadodara")
        records.append(a.to_dict())
    return records


# --- optional live parse of the Census 2011 city table ----------------------
def parse_census_live() -> list[dict]:
    from scripts.extract.fetcher import fetch  # local import so offline needs nothing

    url = "https://www.census2011.co.in/census/city/336-vadodara.html"
    html = fetch(url, cache_key="census2011_vadodara.html")
    if not html:
        return []
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html, flags=re.S | re.I)
    out: list[dict] = []
    for row in rows:
        cells = [re.sub(r"<[^>]+>", "", c).strip()
                 for c in re.findall(r"<td[^>]*>(.*?)</td>", row, flags=re.S | re.I)]
        if len(cells) >= 2 and re.search(r"ward", cells[0], re.I):
            name = cells[1] or cells[0]
            a = Area(name=name, type="ward", taluka="Vadodara",
                     source_ids=["src.census2011.vadodara"], source_links=[url],
                     confidence=0.7, needs_review=True, status="confirmed_official")
            a.id = make_id("area", name, "vadodara")
            out.append(a.to_dict())
    print(f"[census-live] parsed {len(out)} ward rows")
    return out


def merge(base: list[dict], extra: list[dict]) -> list[dict]:
    by_id = {r["id"]: r for r in base}
    for r in extra:
        if r["id"] in by_id:
            cur = by_id[r["id"]]
            cur["last_updated"] = now_iso()
            cur["source_ids"] = sorted(set(cur["source_ids"]) | set(r["source_ids"]))
            cur["source_links"] = sorted(set(cur["source_links"]) | set(r["source_links"]))
        else:
            by_id[r["id"]] = r
    return list(by_id.values())


def main() -> None:
    ap = argparse.ArgumentParser(description="Extract Vadodara AREAS.")
    ap.add_argument("--live", action="store_true", help="also parse Census 2011 live")
    args = ap.parse_args()

    records = build_seed()
    if args.live:
        records = merge(records, parse_census_live())
        try:
            from scripts.extract.areas_osm import fetch_osm_areas
            records = merge(records, fetch_osm_areas())   # grow beyond the seed 90
        except Exception as exc:  # noqa: BLE001
            print(f"[areas] OSM place expansion skipped: {exc}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[areas] wrote {len(records)} raw areas -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
