#!/usr/bin/env python3
"""
Phase 2 extractor — SERVICES (shops, restaurants, professionals).

The loop (plain language):
  for each target locality:
     try the REAL open source (OpenStreetMap via services_osm)   [--live]
     if nothing comes back (blocked/offline) -> use the labelled demo fixture
     turn every raw listing into a Service record (phones normalised, NEVER
     auto-published: contact_consent stays False)

Scope guard: by default we only do a couple of localities (Karelibaug, Alkapuri)
so we can inspect the shape before scaling to all 90 areas. Pass --all to run
over every locality in areas.validated.json, or --locality "Name" to pick one.

  python3 scripts/extract/extract_services.py                 # demo, 2 localities
  python3 scripts/extract/extract_services.py --live          # real OSM if reachable
  python3 scripts/extract/extract_services.py --all --live    # every locality, live
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo.models import Service                       # noqa: E402
from halo.util import make_id, normalize_phone, now_iso  # noqa: E402

OUT = ROOT / "data" / "processed" / "services.json"
DEMO = ROOT / "data" / "seed" / "services_demo.json"
AREAS = ROOT / "data" / "processed" / "areas.validated.json"
DEFAULT_LOCALITIES = ["Karelibaug", "Alkapuri", "Manjalpur", "Gotri",
                      "Sayajigunj", "Fatehgunj"]


def load_demo(localities: list[str]) -> list[dict]:
    recs = json.loads(DEMO.read_text(encoding="utf-8"))["records"]
    out = []
    for r in recs:
        if r["locality"] in localities:
            r = dict(r)
            r["is_demo"] = True          # anything from the fixture is demo, full stop
            out.append(r)
    return out


def to_service(raw: dict) -> dict:
    phone = normalize_phone(raw.get("phone", ""))
    s = Service(
        name=raw["name"],
        category=raw.get("category", "other"),
        description_summary=raw.get("description", ""),
        address=raw.get("address", ""),
        locality=raw.get("locality", ""),
        phone_numbers=[phone] if phone else [],
        contact_consent=False,                      # DPDP: never auto-publish
        rating_score=raw.get("external_rating"),
        rating_count=raw.get("review_count"),
        permanently_closed=bool(raw.get("permanently_closed")),
        coordinates=raw.get("coordinates"),
        is_demo=bool(raw.get("is_demo", False)),
        source_platforms=[raw.get("source_platform", "unknown")],
        last_seen=now_iso(),
        source_links=[raw["source_link"]] if raw.get("source_link") else [],
        source_ids=["src.osm.overpass"] if not raw.get("is_demo") else ["src.seed.curated"],
        confidence=0.5 if not raw.get("is_demo") else 0.2,
        needs_review=True,
    )
    # keep last_review_days on the dict for the validator (recency scoring)
    d = s.to_dict()
    d["_last_review_days"] = raw.get("last_review_days")
    d["id"] = make_id("service", raw["name"], raw.get("locality", ""))
    return d


def target_localities(args) -> list[str]:
    if args.locality:
        return [args.locality]
    if args.all and AREAS.exists():
        areas = json.loads(AREAS.read_text(encoding="utf-8"))
        return [a["name"] for a in areas if a["type"] == "locality"]
    return DEFAULT_LOCALITIES


def main() -> None:
    ap = argparse.ArgumentParser(description="Extract Vadodara SERVICES.")
    ap.add_argument("--live", action="store_true", help="try live sources first")
    ap.add_argument("--all", action="store_true", help="every locality (default: 2)")
    ap.add_argument("--locality", help="single locality name")
    ap.add_argument("--source", default="osm,directories",
                    help="comma list of live sources to try: osm,directories")
    args = ap.parse_args()

    from halo import config, provenance  # noqa: E402
    localities = target_localities(args)
    want = set(args.source.split(","))
    raw: list[dict] = []

    if args.live:
        if "osm" in want:
            if config.get("osm", "deep_city_scrape", default=True):
                from scripts.extract.services_osm import fetch_city_services
                raw.extend(fetch_city_services(localities))   # whole-city, deep
            else:
                from scripts.extract.services_osm import fetch_localities
                raw.extend(fetch_localities(localities))
        if "directories" in want:
            from scripts.extract.directory_client import fetch_directories
            raw.extend(fetch_directories(localities))

    if not raw:
        if config.use_fixtures():
            raw = load_demo(localities)
            provenance.record("src.seed.curated", "fixture",
                              f"served {len(raw)} demo service records (use_fixtures=on)",
                              records=len(raw))
            print(f"[services] {len(raw)} via labelled demo fixture (use_fixtures=on)")
        else:
            provenance.record("src.osm.overpass", "empty",
                              "no live POIs and fixtures disabled -> 0 rows (no demo data)")
            print("[services] 0 real POIs; fixtures disabled -> writing 0 rows (no demo data)")

    records = [to_service(r) for r in raw]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")
    demo_n = sum(1 for r in records if r["is_demo"])
    print(f"[services] wrote {len(records)} raw services "
          f"({demo_n} demo) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
