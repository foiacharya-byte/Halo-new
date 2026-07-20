"""
scripts/extract/areas_osm.py — grow the AREA list from OpenStreetMap place nodes.

The curated seed is ~90 well-known localities. OSM also tags many more
neighbourhoods / suburbs / villages as place=* nodes. This pulls them all inside
the city bbox so the AREA dataset reflects the REAL map, not a fixed 90.
Each new area comes with real coordinates + an OSM source link.
"""
from __future__ import annotations

import json
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import config, provenance                       # noqa: E402
from halo.models import Area                                # noqa: E402
from halo.util import make_id                               # noqa: E402
from scripts.extract.services_osm import geocode_city_bbox, _overpass_query  # noqa: E402

PLACE_TYPE = {
    "city": "locality", "town": "locality", "suburb": "locality",
    "neighbourhood": "locality", "quarter": "locality", "city_block": "locality",
    "borough": "locality", "village": "village", "hamlet": "village",
    "isolated_dwelling": "village", "locality": "locality",
}


def fetch_osm_areas() -> list[dict]:
    if not config.network_allowed():
        provenance.record("src.osm.places", "network_disabled", "allow_network=false")
        return []
    bbox = geocode_city_bbox()
    if bbox is None:
        provenance.record("src.osm.places", "blocked", "city bbox geocode failed")
        return []
    s, w, n, e = bbox
    q = (f'[out:json][timeout:120];'
         f'node["place"~"city|town|suburb|neighbourhood|quarter|city_block|borough|village|hamlet|locality"]'
         f'({s},{w},{n},{e});out;')
    elements, status = _overpass_query(q)
    if status != "ok":
        provenance.record("src.osm.places", "blocked", "overpass failed")
        return []
    out: list[dict] = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name:en") or tags.get("name")
        if not name:
            continue
        a = Area(
            name=name.strip(),
            type=PLACE_TYPE.get(tags.get("place", ""), "locality"),
            taluka="Vadodara",
            coordinates={"lat": el.get("lat"), "lon": el.get("lon")},
            coordinates_source="openstreetmap",
            aliases=[tags["name:gu"]] if tags.get("name:gu") else [],
            source_ids=["src.osm.places"],
            source_links=[f"https://www.openstreetmap.org/node/{el.get('id')}"],
            confidence=0.6, needs_review=True, status="single_source_needs_review",
        )
        a.id = make_id("area", name, "vadodara")
        out.append(a.to_dict())
    provenance.record("src.osm.places", "usable" if out else "partial",
                      f"{len(out)} OSM place nodes", records=len(out))
    print(f"[areas-osm] {len(out)} OSM place nodes")
    return out
