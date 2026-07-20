"""
scripts/extract/services_osm.py — REAL OpenStreetMap client, DEEP city-wide mode.

Two strategies:

  DEEP (default, osm.deep_city_scrape=true) — the strong one:
    1. Geocode the whole city ONCE (Nominatim) to get its bounding box.
    2. Query Overpass over that bbox in a handful of CATEGORY CHUNKS, pulling
       nodes + ways + relations (many shops are polygons, not points) for
       shop / amenity / office / craft / healthcare / tourism / leisure.
    3. Assign every POI to its NEAREST known locality (from area coordinates).
    This returns thousands of real businesses across the entire city in ~8
    robust requests, instead of 90 flaky per-locality calls.

  FALLBACK (per-locality around:radius) — used only if the city bbox can't be
    geocoded. Same output shape.

Resilience: long Overpass timeout, mirror fallback, and the Fetcher retries
transient 5xx/timeouts with backoff. Everything is recorded in the ledger.

>>> GO LIVE <<< set allow_network=true (HALO_ALLOW_NETWORK=1) + a real
HALO_CONTACT_EMAIL. Self-host Overpass for repeated city-scale runs.
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
from scripts.extract.fetcher import Fetcher   # noqa: E402

AREAS = ROOT / "data" / "processed" / "areas.validated.json"

# OSM tag value -> Halo category (broadened for depth)
OSM_CATEGORY = {
    "restaurant": "food", "cafe": "food", "fast_food": "food", "bakery": "food",
    "bar": "food", "pub": "food", "food_court": "food", "ice_cream": "food",
    "clinic": "health", "doctors": "health", "dentist": "health", "pharmacy": "health",
    "hospital": "health", "veterinary": "health", "electronics": "electronics",
    "hardware": "hardware", "doityourself": "hardware", "supermarket": "grocery",
    "convenience": "grocery", "greengrocer": "grocery", "electrician": "electrician",
    "car_repair": "auto", "car": "auto", "motorcycle": "auto", "tyres": "auto",
    "beauty": "salon", "hairdresser": "salon", "bank": "finance", "atm": "finance",
    "fuel": "fuel", "school": "education", "college": "education", "university": "education",
    "clothes": "shopping", "jewelry": "shopping", "mobile_phone": "electronics",
    "furniture": "shopping", "hotel": "hospitality", "guest_house": "hospitality",
}

# Each chunk = one Overpass query over the city bbox (node+way+relation).
# Broadened for maximum legitimate depth — every business/institution key OSM has.
FILTERS = [
    '["shop"]',                       # all retail
    '["amenity"~"restaurant|cafe|fast_food|bar|pub|food_court|ice_cream|bakery|marketplace|nightclub"]',
    '["amenity"~"pharmacy|hospital|clinic|doctors|dentist|veterinary|nursing_home"]',
    '["amenity"~"bank|atm|bureau_de_change|fuel|charging_station|car_wash|car_rental"]',
    '["amenity"~"school|college|university|kindergarten|driving_school|language_school|training|library"]',
    '["amenity"~"cinema|theatre|community_centre|social_facility|place_of_worship|courthouse|police|fire_station|post_office|townhall"]',
    '["office"]',                     # professionals: lawyers, CAs, IT, estate agents...
    '["craft"]',                      # electricians, plumbers, carpenters, tailors...
    '["healthcare"]',                 # clinics/labs/physio not tagged as amenity
    '["tourism"]',                    # hotels, guest houses, museums, attractions
    '["leisure"~"fitness_centre|sports_centre|stadium|park|garden|swimming_pool|water_park"]',
    '["historic"]',                   # monuments, forts, heritage
    '["building"~"commercial|retail|industrial|office|hotel|hospital|supermarket"]',
]

_fetcher: Fetcher | None = None


def _f() -> Fetcher:
    global _fetcher
    if _fetcher is None:
        _fetcher = Fetcher()
    return _fetcher


def _respect_robots() -> bool:
    return bool(config.get("osm", "respect_robots", default=False))


def blocked_hint() -> None:
    print(
        "[osm] ── All OSM calls failed. Exact per-call reason printed above as\n"
        "[osm]    'failed — <reason>'. Common fixes:\n"
        "[osm]    - SSL error (Windows)  -> pip install certifi\n"
        "[osm]    - http_403             -> set HALO_CONTACT_EMAIL / check proxy\n"
        "[osm]    - http_5xx / timed out -> public Overpass is overloaded; retry later\n"
        "[osm]                             or self-host (set HALO_OVERPASS_URL=localhost)\n"
        "[osm]    Quick test:  python scripts/diagnose_osm.py")


# ---------------------------------------------------------------------------
# geocoding
# ---------------------------------------------------------------------------
def _nominatim(query: str, extra: dict | None = None) -> list[dict] | None:
    base = config.get("osm", "nominatim_url")
    ndelay = float(config.get("osm", "nominatim_min_delay_seconds", default=1.0))
    email = config.get("runtime", "contact_email", default="")
    params = {"q": query, "format": "json", "limit": 1}
    if email and "example.com" not in email:
        params["email"] = email
    params.update(extra or {})
    res = _f().get(f"{base}?{urllib.parse.urlencode(params)}",
                   respect_robots=_respect_robots(), min_delay=ndelay)
    if not res.ok:
        print(f"[osm] nominatim failed — {res.reason}")
        return None
    try:
        return json.loads(res.text)
    except Exception:  # noqa: BLE001
        return None


def geocode(locality: str) -> tuple[tuple[float, float] | None, str]:
    """Geocode ONE locality. Tries a specific then a looser query. status: ok|empty|error."""
    for q in (f"{locality}, Vadodara, Gujarat, India", f"{locality}, Vadodara"):
        arr = _nominatim(q)
        if arr is None:
            return None, "error"
        if arr:
            return (float(arr[0]["lat"]), float(arr[0]["lon"])), "ok"
    return None, "empty"


def geocode_city_bbox() -> tuple[float, float, float, float] | None:
    """Return (south, west, north, east) for the city, or None."""
    arr = _nominatim(config.get("osm", "city_query", default="Vadodara, Gujarat, India"))
    if not arr:
        return None
    bb = arr[0].get("boundingbox")  # [south, north, west, east] (strings)
    if not bb or len(bb) != 4:
        return None
    s, n, w, e = float(bb[0]), float(bb[1]), float(bb[2]), float(bb[3])
    return (s, w, n, e)


# ---------------------------------------------------------------------------
# POI parsing + locality assignment
# ---------------------------------------------------------------------------
def _haversine(a: tuple[float, float], b: tuple[float, float]) -> float:
    dlat, dlon = math.radians(b[0] - a[0]), math.radians(b[1] - a[1])
    h = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(a[0])) * math.cos(math.radians(b[0])) * math.sin(dlon / 2) ** 2)
    return 2 * 6371.0 * math.asin(math.sqrt(h))


def load_area_coords() -> dict[str, tuple[float, float]]:
    if not AREAS.exists():
        return {}
    out = {}
    for a in json.loads(AREAS.read_text(encoding="utf-8")):
        c = a.get("coordinates")
        if c and c.get("lat") is not None:
            out[a["name"]] = (c["lat"], c["lon"])
    return out


def nearest_locality(lat: float, lon: float, coords: dict[str, tuple[float, float]]) -> str:
    if not coords:
        return "Vadodara"
    return min(coords.items(), key=lambda kv: _haversine((lat, lon), kv[1]))[0]


def _element_to_poi(el: dict, coords: dict[str, tuple[float, float]]) -> dict | None:
    tags = el.get("tags", {})
    name = tags.get("name")
    if not name:
        return None
    if el["type"] == "node":
        lat, lon = el.get("lat"), el.get("lon")
    else:  # way/relation -> use the computed center
        c = el.get("center", {})
        lat, lon = c.get("lat"), c.get("lon")
    if lat is None or lon is None:
        return None
    raw_cat = (tags.get("shop") or tags.get("amenity") or tags.get("office")
               or tags.get("craft") or tags.get("healthcare") or tags.get("tourism")
               or tags.get("leisure") or "")
    # prefer OSM's own suburb if it names a known area, else nearest centroid
    suburb = tags.get("addr:suburb")
    locality = suburb if (suburb in coords) else nearest_locality(lat, lon, coords)
    return {
        "locality": locality, "name": name,
        "category": OSM_CATEGORY.get(raw_cat, raw_cat or "other"),
        "description": tags.get("description", ""),
        "address": ", ".join(filter(None, [
            tags.get("addr:housenumber"), tags.get("addr:street"),
            tags.get("addr:suburb"), locality])),
        "phone": tags.get("phone") or tags.get("contact:phone", ""),
        "external_rating": None, "review_count": None, "last_review_days": None,
        "permanently_closed": tags.get("disused") == "yes",
        "source_platform": "openstreetmap",
        "coordinates": {"lat": lat, "lon": lon},
        "source_link": f"https://www.openstreetmap.org/{el['type']}/{el.get('id')}",
        "is_demo": False,
    }


# ---------------------------------------------------------------------------
# Overpass
# ---------------------------------------------------------------------------
def _overpass_query(body: str) -> tuple[list[dict], str]:
    """Run one Overpass query string across primary + mirrors. (elements, status)."""
    timeout = int(config.get("osm", "overpass_timeout_seconds", default=180))
    odelay = float(config.get("osm", "overpass_min_delay_seconds", default=3.0))
    endpoints = [config.get("osm", "overpass_url")] + list(
        config.get("osm", "overpass_mirrors", default=[]))
    data = urllib.parse.urlencode({"data": body})
    for ep in endpoints:
        res = _f().get(f"{ep}?{data}", respect_robots=_respect_robots(),
                       min_delay=odelay, timeout=timeout + 15)
        if res.ok:
            try:
                return json.loads(res.text).get("elements", []), "ok"
            except Exception:  # noqa: BLE001
                return [], "error"
        print(f"[osm] overpass {ep.split('/')[2]} failed — {res.reason}")
    return [], "error"


def fetch_city_services(fallback_localities: list[str]) -> list[dict]:
    """DEEP: pull the whole city bbox by category chunks; assign nearest locality."""
    if not config.network_allowed():
        provenance.record("src.osm.overpass", "network_disabled",
                          "allow_network=false (sandbox); using fixtures")
        return []

    bbox = geocode_city_bbox()
    if bbox is None:
        print("[osm] city bbox geocode failed — falling back to per-locality mode")
        return fetch_localities(fallback_localities)

    s, w, n, e = bbox
    timeout = int(config.get("osm", "overpass_timeout_seconds", default=180))
    coords = load_area_coords()
    by_id: dict[str, dict] = {}
    ok_chunks = err_chunks = 0

    print(f"[osm] deep city scrape · bbox=({s:.3f},{w:.3f},{n:.3f},{e:.3f}) · "
          f"{len(FILTERS)} category chunks")
    for filt in FILTERS:
        body = (f"[out:json][timeout:{timeout}];("
                f'node{filt}({s},{w},{n},{e});'
                f'way{filt}({s},{w},{n},{e});'
                f'relation{filt}({s},{w},{n},{e}););out center tags;')
        elements, status = _overpass_query(body)
        if status != "ok":
            err_chunks += 1
            continue
        ok_chunks += 1
        added = 0
        for el in elements:
            poi = _element_to_poi(el, coords)
            if poi:
                by_id[f"{el['type']}/{el['id']}"] = poi
                added += 1
        print(f"[osm]   {filt}: {added} POIs (running total {len(by_id)})")

    records = list(by_id.values())
    if ok_chunks and records:
        status = "usable" if err_chunks == 0 else "partial"
    elif err_chunks and not records:
        status = "blocked"
    else:
        status = "partial"
    provenance.record("src.osm.overpass", status,
                      f"deep city scrape: {len(records)} POIs from {ok_chunks}/"
                      f"{len(FILTERS)} chunks (errors={err_chunks})", records=len(records))
    print(f"[osm] deep scrape aggregate: {status} — {len(records)} POIs")
    if status == "blocked":
        blocked_hint()
    return records


# ---------------------------------------------------------------------------
# Fallback: per-locality around:radius
# ---------------------------------------------------------------------------
def _overpass_around(locality: str, lat: float, lon: float) -> tuple[list[dict], str]:
    radius = int(config.get("osm", "radius_m", default=1500))
    body = (f"[out:json][timeout:60];("
            f'node["shop"](around:{radius},{lat},{lon});'
            f'way["shop"](around:{radius},{lat},{lon});'
            f'node["amenity"~"restaurant|cafe|fast_food|clinic|doctors|dentist|pharmacy|hospital"](around:{radius},{lat},{lon})'
            f");out center tags;")
    elements, status = _overpass_query(body)
    if status != "ok":
        return [], "error"
    coords = load_area_coords()
    out = [p for p in (_element_to_poi(el, coords) for el in elements) if p]
    for p in out:
        p["locality"] = locality
    return out, ("ok" if out else "empty")


def fetch_locality(locality: str) -> tuple[list[dict], str]:
    coords, gstatus = geocode(locality)
    if gstatus != "ok":
        print(f"[osm] {locality}: geocode {gstatus} — skipping")
        return [], gstatus if gstatus == "empty" else "error"
    lat, lon = coords  # type: ignore[misc]
    records, ostatus = _overpass_around(locality, lat, lon)
    if ostatus == "error":
        print(f"[osm] {locality}: Overpass error — skipping")
        return [], "error"
    print(f"[osm] {locality}: {len(records)} POIs")
    return records, ostatus


def fetch_localities(localities: list[str]) -> list[dict]:
    if not config.network_allowed():
        provenance.record("src.osm.overpass", "network_disabled",
                          "allow_network=false (sandbox); using fixtures")
        return []
    all_records: list[dict] = []
    ok = empty = error = 0
    for loc in localities:
        records, outcome = fetch_locality(loc)
        all_records.extend(records)
        ok += outcome == "ok"
        empty += outcome == "empty"
        error += outcome == "error"
    if ok > 0:
        status = "usable" if (empty == 0 and error == 0) else "partial"
    elif error > 0:
        status = "blocked"
    else:
        status = "partial"
    provenance.record("src.osm.overpass", status,
                      f"{ok}/{len(localities)} localities usable, {len(all_records)} POIs",
                      records=len(all_records))
    print(f"[osm] aggregate: {status} — {ok}/{len(localities)} localities, {len(all_records)} POIs")
    if status == "blocked":
        blocked_hint()
    return all_records
