#!/usr/bin/env python3
"""
Phase 2 extractor — AREAS (wards / localities / villages of Vadodara).

Two modes:
  * default (offline): build from the committed SEED below — well-known Vadodara
    localities that recur across many open sources. Every record is flagged
    needs_review=True and carries source_ids from sources_catalogue/sources.json.
  * --live: additionally parse the Census 2011 city ward table via http.fetch()
    (robots-respecting) and merge. Live parsing is best-effort; if the page shape
    changes we keep the seed and log it — the pipeline never hard-fails.

HONESTY NOTES (read me):
  * PIN codes below are the commonly-cited codes for each locality but are marked
    for verification against India Post (src.pincode.indiapost). Do not present
    them as confirmed until validate/geocode fills them from an official source.
  * parent_zone (VMC North/South/East/West) is a BEST-EFFORT grouping. VMC has
    re-drawn zones/wards (post-2021: 4 zones, 19 wards); exact ward↔locality
    mapping MUST be verified against VMC before it earns a trust badge.
  * coordinates are left null on purpose — geocode later from OpenStreetMap
    (open, ODbL) rather than guessing lat/lon.
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

OUT = ROOT / "data" / "processed" / "areas.json"

# Broad zone grouping — BEST EFFORT, verify against VMC. Localities not confidently
# placed are left with parent_zone=None.
SEED = [
    # name, type, parent_zone, pin_codes, aliases
    ("Alkapuri", "locality", "West", ["390005", "390007"], []),
    ("Sayajigunj", "locality", "Central", ["390005", "390020"], ["Sayaji Gunj"]),
    ("Fatehgunj", "locality", "North", ["390002"], ["Fateh Gunj"]),
    ("Karelibaug", "locality", "East", ["390018"], ["Kareli Baug", "Karelibag"]),
    ("Harni", "locality", "East", ["390022"], []),
    ("Sama", "locality", "North", ["390008", "390024"], ["Sama-Savli"]),
    ("Gotri", "locality", "West", ["390021"], []),
    ("Akota", "locality", "West", ["390020"], ["Akota Gardens"]),
    ("Manjalpur", "locality", "South", ["390011"], []),
    ("Nizampura", "locality", "North", ["390002"], []),
    ("Subhanpura", "locality", "West", ["390023"], []),
    ("Vasna", "locality", "West", ["390007", "390015"], ["Vasna Road"]),
    ("Tandalja", "locality", "West", ["390012"], []),
    ("Old Padra Road", "locality", "West", ["390007", "390015"], ["OP Road"]),
    ("Ellora Park", "locality", "West", ["390023"], ["Ellorapark"]),
    ("Race Course", "locality", "Central", ["390007"], ["Racecourse"]),
    ("Makarpura", "locality", "South", ["390009", "390010", "390013"], []),
    ("Gorwa", "locality", "North", ["390016"], []),
    ("Chhani", "locality", "North", ["391740"], ["Chani"]),
    ("Ajwa Road", "locality", "East", ["390019"], ["Ajwa"]),
    ("Dandia Bazar", "locality", "Central", ["390001"], ["Dandiya Bazar"]),
    ("Mandvi", "locality", "Central", ["390001"], []),
    ("Raopura", "locality", "Central", ["390001"], []),
    ("Wadi", "locality", "Central", ["390017"], []),
    ("Pratapnagar", "locality", "South", ["390004"], ["Pratap Nagar"]),
    ("Bapod", "locality", "East", ["390019"], []),
    ("Vemali", "locality", "East", ["390025"], []),
    ("Diwalipura", "locality", "West", ["390015"], ["Diwali Pura"]),
    ("Waghodia Road", "locality", "East", ["390019"], ["Waghodia"]),
    ("Manisha", "locality", "West", ["390015"], ["Manisha Circle"]),
    ("Sun Pharma Road", "locality", "West", ["390012"], ["Atladara"]),
    ("Atladara", "locality", "West", ["390012"], []),
    ("Sevasi", "village", "West", ["391101"], []),
    ("Bhayli", "village", "West", ["391410"], []),
    ("Vadsar", "locality", "South", ["390010"], []),
    ("Tarsali", "locality", "South", ["390009"], []),
]


def build_seed() -> list[dict]:
    records: list[dict] = []
    for name, typ, zone, pins, aliases in SEED:
        a = Area(
            name=name,
            type=typ,
            parent_zone=zone,
            pin_codes=pins,
            aliases=aliases,
            coordinates=None,
            source_ids=["src.census2011.vadodara", "src.vmc.official"],
            source_links=[
                "https://www.census2011.co.in/census/city/336-vadodara.html",
                "https://vmc.gov.in/",
            ],
            confidence=0.55,      # seed-level: recurs across sources, not yet verified
            needs_review=True,
        )
        a.id = make_id("area", name, "vadodara")
        records.append(a.to_dict())
    return records


# --- optional live parse of the Census 2011 city table ----------------------
def parse_census_live() -> list[dict]:
    from scripts.extract.http import fetch  # local import so offline needs nothing

    url = "https://www.census2011.co.in/census/city/336-vadodara.html"
    html = fetch(url, cache_key="census2011_vadodara.html")
    if not html:
        return []
    # Very light table scrape: pull <td> ward names from the ward table if present.
    # Robust-by-pattern (not fragile xpath); if the shape changed we simply get [].
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html, flags=re.S | re.I)
    out: list[dict] = []
    for row in rows:
        cells = re.findall(r"<td[^>]*>(.*?)</td>", row, flags=re.S | re.I)
        cells = [re.sub(r"<[^>]+>", "", c).strip() for c in cells]
        if len(cells) >= 2 and re.search(r"ward", cells[0], re.I):
            name = cells[1] or cells[0]
            a = Area(
                name=name, type="ward",
                source_ids=["src.census2011.vadodara"],
                source_links=[url], confidence=0.7, needs_review=True,
            )
            a.id = make_id("area", name, "vadodara")
            out.append(a.to_dict())
    print(f"[census-live] parsed {len(out)} ward rows")
    return out


def merge(base: list[dict], extra: list[dict]) -> list[dict]:
    by_id = {r["id"]: r for r in base}
    for r in extra:
        if r["id"] in by_id:
            # refresh freshness + union source ids
            cur = by_id[r["id"]]
            cur["last_updated"] = now_iso()
            cur["source_ids"] = sorted(set(cur["source_ids"]) | set(r["source_ids"]))
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

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[areas] wrote {len(records)} areas -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
