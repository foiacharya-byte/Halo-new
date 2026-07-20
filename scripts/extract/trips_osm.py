"""
scripts/extract/trips_osm.py — REAL OSM client for TRIP SPOTS around Vadodara.

Pulls temples, forts/palaces, museums, lakes/dams, hills/viewpoints, parks and
picnic spots within `trips_radius_km` of the city centre (default 60 km), tags
each with a type + mood, and computes its distance from Vadodara. Open data
(ODbL), same resilient fetcher/mirrors as the services scraper.
"""
from __future__ import annotations

import json
import math
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import config, provenance          # noqa: E402
from scripts.extract.services_osm import _overpass_query, _nominatim, _respect_robots  # noqa: E402

# tag -> (trip type, mood tags)
def _classify(tags: dict) -> tuple[str, list[str]]:
    hist = tags.get("historic")
    tour = tags.get("tourism")
    nat = tags.get("natural")
    leis = tags.get("leisure")
    if tags.get("amenity") == "place_of_worship" or hist in ("temple", "shrine"):
        return "temple", ["spiritual", "peaceful"]
    if hist in ("fort", "castle", "fortification"):
        return "fort", ["heritage", "culture"]
    if hist in ("monument", "memorial", "ruins", "archaeological_site", "manor", "palace"):
        return "heritage", ["heritage", "culture"]
    if tour in ("museum", "gallery"):
        return "museum", ["heritage", "culture"]
    if tour in ("theme_park", "attraction", "zoo", "aquarium"):
        return "attraction", ["fun", "family"]
    if tour == "viewpoint" or nat in ("peak", "hill", "cliff", "ridge"):
        return "hill", ["adventure", "scenic"]
    if (nat in ("water", "bay", "beach") or tags.get("water") == "reservoir"
            or tags.get("waterway") == "dam" or tags.get("landuse") == "reservoir"):
        return "lake_dam", ["peaceful", "picnic", "scenic"]
    if leis in ("park", "garden", "nature_reserve"):
        return "park", ["peaceful", "family"]
    if leis == "water_park" or tour == "camp_site" or tour == "picnic_site":
        return "picnic", ["picnic", "family", "fun"]
    return "attraction", ["scenic"]


FILTERS = [
    '["tourism"~"attraction|museum|gallery|zoo|theme_park|viewpoint|artwork|picnic_site|camp_site|aquarium"]',
    '["historic"]',
    '["amenity"="place_of_worship"]',
    '["natural"~"peak|water|beach|cliff|hill"]',
    '["leisure"~"park|nature_reserve|water_park|garden"]',
    '["waterway"="dam"]',
    '["landuse"="reservoir"]',
]


def _haversine(a, b) -> float:
    dlat, dlon = math.radians(b[0] - a[0]), math.radians(b[1] - a[1])
    h = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(a[0])) * math.cos(math.radians(b[0])) * math.sin(dlon / 2) ** 2)
    return 2 * 6371.0 * math.asin(math.sqrt(h))


def city_center() -> tuple[float, float] | None:
    arr = _nominatim(config.get("osm", "trips_query", default="Vadodara, Gujarat, India"))
    if not arr:
        return None
    return (float(arr[0]["lat"]), float(arr[0]["lon"]))


def fetch_trip_spots() -> list[dict]:
    if not config.network_allowed():
        provenance.record("src.osm.trips", "network_disabled",
                          "allow_network=false (sandbox); using fixtures")
        return []
    center = city_center()
    if center is None:
        provenance.record("src.osm.trips", "blocked", "city centre geocode failed")
        return []
    lat, lon = center
    radius_km = float(config.get("osm", "trips_radius_km", default=60))
    r_m = int(radius_km * 1000)
    timeout = int(config.get("osm", "overpass_timeout_seconds", default=180))

    by_id: dict[str, dict] = {}
    ok = err = 0
    for filt in FILTERS:
        parts = "".join(f'{t}{filt}(around:{r_m},{lat},{lon});'
                        for t in ("node", "way", "relation"))
        elements, status = _overpass_query(f"[out:json][timeout:{timeout}];({parts});out center tags;")
        if status != "ok":
            err += 1
            continue
        ok += 1
        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name")
            if not name:
                continue
            if el["type"] == "node":
                plat, plon = el.get("lat"), el.get("lon")
            else:
                c = el.get("center", {})
                plat, plon = c.get("lat"), c.get("lon")
            if plat is None or plon is None:
                continue
            dist = _haversine(center, (plat, plon))
            if dist > radius_km:
                continue
            typ, moods = _classify(tags)
            by_id[f"{el['type']}/{el['id']}"] = {
                "name": name, "distance_km": round(dist, 1), "type": typ,
                "best_for_mood": moods,
                "description": tags.get("description", ""),
                "how_to_reach": f"~{round(dist)} km from Vadodara city centre",
                "coordinates": {"lat": plat, "lon": plon},
                "source_link": f"https://www.openstreetmap.org/{el['type']}/{el.get('id')}",
                "is_demo": False,
            }
    records = sorted(by_id.values(), key=lambda r: r["distance_km"])
    status = "usable" if (ok and records and err == 0) else "partial" if records else "blocked"
    provenance.record("src.osm.trips", status,
                      f"{len(records)} spots within {radius_km:.0f} km "
                      f"({ok}/{len(FILTERS)} filters ok)", records=len(records))
    print(f"[trips] {len(records)} spots within {radius_km:.0f} km ({status})")
    return records
