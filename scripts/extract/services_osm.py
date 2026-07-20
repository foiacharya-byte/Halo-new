"""
scripts/extract/services_osm.py — the REAL open-source services client.

In plain language: OpenStreetMap is a free, openly-licensed map of the world.
This module asks two OSM services (both free, both open):
  1. Nominatim  -> "where is Alkapuri, Vadodara?" (a centre lat/lon)
  2. Overpass   -> "list shops/clinics/restaurants within N metres of that point"
and turns the answers into raw service dicts with REAL names, categories and
coordinates, plus a real source link back to OSM.

Licensing/citizenship: OSM data is ODbL (attribution required — we store the
source link). We send an honest User-Agent and rate-limit. Phone tags, when
present, are stored as LEADS only (contact_consent stays false upstream).

This is best-effort and NEVER raises: if the network policy blocks OSM (as in
the current sandbox) it returns [] and the extractor falls back to the labelled
demo fixture. When run where OSM is reachable, real records flow through.
"""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request

USER_AGENT = "HaloVadodaraBot/0.1 (+https://halo.local; open-city-data)"
NOMINATIM = "https://nominatim.openstreetmap.org/search"
OVERPASS = "https://overpass-api.de/api/interpreter"

# Map OSM tags -> Halo categories. Extend freely.
OSM_CATEGORY = {
    "restaurant": "food", "cafe": "food", "fast_food": "food", "bakery": "food",
    "clinic": "health", "doctors": "health", "dentist": "health", "pharmacy": "health",
    "hospital": "health", "electronics": "electronics", "hardware": "hardware",
    "supermarket": "grocery", "convenience": "grocery", "electrician": "electrician",
    "car_repair": "auto", "beauty": "salon", "hairdresser": "salon",
}


def _get(url: str, timeout: int = 25) -> str | None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        time.sleep(1.0)  # be polite
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode("utf-8", "replace")
    except Exception as exc:  # noqa: BLE001
        print(f"[osm] blocked/unreachable ({exc}) — falling back to fixture.")
        return None


def geocode(locality: str) -> tuple[float, float] | None:
    q = urllib.parse.urlencode({"q": f"{locality}, Vadodara, Gujarat, India",
                                "format": "json", "limit": 1})
    body = _get(f"{NOMINATIM}?{q}")
    if not body:
        return None
    try:
        arr = json.loads(body)
        return (float(arr[0]["lat"]), float(arr[0]["lon"])) if arr else None
    except Exception:  # noqa: BLE001
        return None


def fetch_locality(locality: str, radius_m: int = 1200) -> list[dict]:
    """Return raw service dicts around a locality (empty list if OSM unreachable)."""
    center = geocode(locality)
    if not center:
        return []
    lat, lon = center
    query = f"""
    [out:json][timeout:25];
    (
      node["shop"](around:{radius_m},{lat},{lon});
      node["amenity"~"restaurant|cafe|fast_food|clinic|doctors|dentist|pharmacy|hospital"](around:{radius_m},{lat},{lon});
    );
    out center 60;
    """
    body = _get(f"{OVERPASS}?{urllib.parse.urlencode({'data': query})}")
    if not body:
        return []
    try:
        elements = json.loads(body).get("elements", [])
    except Exception:  # noqa: BLE001
        return []

    out: list[dict] = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue
        raw_cat = tags.get("shop") or tags.get("amenity") or ""
        out.append({
            "locality": locality,
            "name": name,
            "category": OSM_CATEGORY.get(raw_cat, raw_cat or "other"),
            "description": tags.get("description", ""),
            "address": ", ".join(filter(None, [
                tags.get("addr:street"), tags.get("addr:suburb"), locality])),
            "phone": tags.get("phone") or tags.get("contact:phone", ""),
            "external_rating": None,      # OSM has no ratings — honest null
            "review_count": None,
            "last_review_days": None,
            "permanently_closed": tags.get("disused") == "yes",
            "source_platform": "openstreetmap",
            "coordinates": {"lat": el.get("lat"), "lon": el.get("lon")},
            "source_link": f"https://www.openstreetmap.org/node/{el.get('id')}",
            "is_demo": False,
        })
    print(f"[osm] {locality}: {len(out)} real POIs")
    return out
