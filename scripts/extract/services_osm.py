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

# Each tile query unions ALL of these. Broadened to capture EVERYTHING named in
# OSM (we keep only named features, so this is businesses/institutions, not noise).
FILTERS = [
    '["shop"]',            # all retail (every shop value)
    '["amenity"]',         # all amenities — food, health, finance, education, civic…
    '["office"]',          # professionals: lawyers, CAs, IT, estate agents, insurance…
    '["craft"]',           # electricians, plumbers, carpenters, tailors, mechanics…
    '["healthcare"]',      # clinics/labs/physio not tagged as amenity
    '["tourism"]',         # hotels, guest houses, museums, attractions
    '["leisure"]',         # gyms, parks, sports, gardens
    '["historic"]',        # monuments, forts, heritage
    '["club"]',            # associations, clubs
    '["building"~"commercial|retail|industrial|office|hotel|hospital|supermarket|school|university"]',
]

# OSM tags worth keeping per POI (rich detail OSM actually has).
RICH_TAGS = ["website", "contact:website", "opening_hours", "cuisine", "brand",
             "operator", "contact:email", "email", "wheelchair", "level",
             "addr:full", "description", "stars", "internet_access", "smoking",
             "takeaway", "delivery", "outdoor_seating", "air_conditioning"]

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
               or tags.get("leisure") or tags.get("club") or "")
    # prefer OSM's own suburb if it names a known area, else nearest centroid
    suburb = tags.get("addr:suburb")
    locality = suburb if (suburb in coords) else nearest_locality(lat, lon, coords)
    # harvest the rich detail OSM actually has
    attrs = {}
    for t in RICH_TAGS:
        if tags.get(t):
            attrs[t.replace("contact:", "").replace("addr:", "")] = tags[t]
    desc_bits = [tags.get("description", ""), tags.get("cuisine", ""),
                 tags.get("brand", "")]
    return {
        "locality": locality, "name": name,
        "category": OSM_CATEGORY.get(raw_cat, raw_cat or "other"),
        "description": " · ".join(b for b in desc_bits if b),
        "address": tags.get("addr:full") or ", ".join(filter(None, [
            tags.get("addr:housenumber"), tags.get("addr:street"),
            tags.get("addr:suburb"), locality])),
        "phone": tags.get("phone") or tags.get("contact:phone", ""),
        "website": tags.get("website") or tags.get("contact:website", ""),
        "opening_hours": tags.get("opening_hours", ""),
        "attributes": attrs,
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


def _grid_tiles(bbox: tuple[float, float, float, float], grid: int):
    """Yield (s,w,n,e) sub-tiles covering the city bbox in a grid x grid mesh."""
    s, w, n, e = bbox
    for i in range(grid):
        for j in range(grid):
            ts = s + (n - s) * i / grid
            tn = s + (n - s) * (i + 1) / grid
            tw = w + (e - w) * j / grid
            te = w + (e - w) * (j + 1) / grid
            yield (ts, tw, tn, te)


def _tile_query(s: float, w: float, n: float, e: float, timeout: int) -> str:
    """One request per tile: every FILTER unioned over node+way+relation."""
    parts = []
    for filt in FILTERS:
        for typ in ("node", "way", "relation"):
            parts.append(f"{typ}{filt}({s},{w},{n},{e});")
    return f"[out:json][timeout:{timeout}];({''.join(parts)});out center tags;"


def fetch_city_services(fallback_localities: list[str]) -> list[dict]:
    """
    DEEP: tile the whole city into grid x grid cells and scrape EVERY category in
    each tile (one request per tile). Small tile queries never 504, and together
    they cover the entire city — area by area — with nothing skipped.
    """
    if not config.network_allowed():
        provenance.record("src.osm.overpass", "network_disabled",
                          "allow_network=false (sandbox); using fixtures")
        return []

    bbox = geocode_city_bbox()
    if bbox is None:
        print("[osm] city bbox geocode failed — falling back to per-locality mode")
        return fetch_localities(fallback_localities)

    grid = max(1, int(config.get("osm", "grid", default=4)))
    timeout = int(config.get("osm", "overpass_timeout_seconds", default=180))
    coords = load_area_coords()
    tiles = list(_grid_tiles(bbox, grid))
    by_id: dict[str, dict] = {}
    ok_tiles = err_tiles = 0

    print(f"[osm] deep city scrape · {grid}x{grid} = {len(tiles)} tiles · "
          f"all {len(FILTERS)} categories per tile")
    for idx, (s, w, n, e) in enumerate(tiles, 1):
        elements, status = _overpass_query(_tile_query(s, w, n, e, timeout))
        if status != "ok":
            err_tiles += 1
            print(f"[osm]   tile {idx}/{len(tiles)}: FAILED (kept going)")
            continue
        ok_tiles += 1
        added = 0
        for el in elements:
            poi = _element_to_poi(el, coords)
            if poi:
                key = f"{el['type']}/{el['id']}"
                if key not in by_id:
                    added += 1
                by_id[key] = poi
        print(f"[osm]   tile {idx}/{len(tiles)}: +{added} new (total {len(by_id)})")

    records = list(by_id.values())
    if ok_tiles and records:
        status = "usable" if err_tiles == 0 else "partial"
    elif err_tiles and not records:
        status = "blocked"
    else:
        status = "partial"
    provenance.record("src.osm.overpass", status,
                      f"deep tiled scrape: {len(records)} POIs from {ok_tiles}/"
                      f"{len(tiles)} tiles (failed={err_tiles})", records=len(records))
    print(f"[osm] deep scrape aggregate: {status} — {len(records)} POIs "
          f"({ok_tiles}/{len(tiles)} tiles ok)")
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
