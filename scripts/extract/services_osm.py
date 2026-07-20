"""
scripts/extract/services_osm.py — REAL OpenStreetMap client (config-driven).

Pipeline per locality:
  Nominatim geocode -> centre lat/lon
  Overpass "around:radius" -> every shop/amenity near it (real names, cats,
  coords, sometimes phone). Radius + endpoints come from halo_config.json.

>>> TO GO LIVE ON YOUR OWN MACHINE <<<
  Set runtime.allow_network=true in halo_config.json (or env HALO_ALLOW_NETWORK=1).
  For city-scale runs, self-host Overpass/Nominatim and point the *_url config at
  localhost (see osm.self_host_note). Until then this returns [] in the sandbox
  and the extractor falls back to the labelled demo fixture.

Everything is recorded in the source ledger (halo/provenance.py) so the dataset
honestly shows whether OSM was usable, blocked, or network-disabled.
"""
from __future__ import annotations

import json
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import config, provenance          # noqa: E402
from scripts.extract.fetcher import Fetcher      # noqa: E402

OSM_CATEGORY = {
    "restaurant": "food", "cafe": "food", "fast_food": "food", "bakery": "food",
    "clinic": "health", "doctors": "health", "dentist": "health", "pharmacy": "health",
    "hospital": "health", "electronics": "electronics", "hardware": "hardware",
    "supermarket": "grocery", "convenience": "grocery", "electrician": "electrician",
    "car_repair": "auto", "beauty": "salon", "hairdresser": "salon",
}

_fetcher: Fetcher | None = None


def _f() -> Fetcher:
    global _fetcher
    if _fetcher is None:
        _fetcher = Fetcher()
    return _fetcher


def geocode(locality: str) -> tuple[float, float] | None:
    base = config.get("osm", "nominatim_url")
    q = urllib.parse.urlencode({"q": f"{locality}, Vadodara, Gujarat, India",
                                "format": "json", "limit": 1})
    res = _f().get(f"{base}?{q}")
    if not res.ok:
        return None
    try:
        arr = json.loads(res.text)
        return (float(arr[0]["lat"]), float(arr[0]["lon"])) if arr else None
    except Exception:  # noqa: BLE001
        return None


def fetch_locality(locality: str) -> list[dict]:
    """Real POIs around a locality. [] if network disabled/blocked (ledger records why)."""
    if not config.network_allowed():
        provenance.record("src.osm.overpass", "network_disabled",
                          "allow_network=false (sandbox); using fixtures")
        return []

    center = geocode(locality)
    if center is None:
        provenance.record("src.osm.overpass", "blocked",
                          f"Nominatim geocode failed for {locality}")
        return []

    lat, lon = center
    radius = int(config.get("osm", "radius_m", default=1500))
    overpass = config.get("osm", "overpass_url")
    query = f"""
    [out:json][timeout:25];
    (
      node["shop"](around:{radius},{lat},{lon});
      node["amenity"~"restaurant|cafe|fast_food|clinic|doctors|dentist|pharmacy|hospital"](around:{radius},{lat},{lon});
    );
    out center 200;
    """
    res = _f().get(f"{overpass}?{urllib.parse.urlencode({'data': query})}")
    if not res.ok:
        provenance.record("src.osm.overpass", "blocked" if res.blocked else "partial",
                          f"Overpass {res.reason} for {locality}")
        return []

    try:
        elements = json.loads(res.text).get("elements", [])
    except Exception:  # noqa: BLE001
        provenance.record("src.osm.overpass", "partial", "Overpass parse error")
        return []

    out: list[dict] = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue
        raw_cat = tags.get("shop") or tags.get("amenity") or ""
        out.append({
            "locality": locality, "name": name,
            "category": OSM_CATEGORY.get(raw_cat, raw_cat or "other"),
            "description": tags.get("description", ""),
            "address": ", ".join(filter(None, [tags.get("addr:street"),
                                                tags.get("addr:suburb"), locality])),
            "phone": tags.get("phone") or tags.get("contact:phone", ""),
            "external_rating": None, "review_count": None, "last_review_days": None,
            "permanently_closed": tags.get("disused") == "yes",
            "source_platform": "openstreetmap",
            "coordinates": {"lat": el.get("lat"), "lon": el.get("lon")},
            "source_link": f"https://www.openstreetmap.org/node/{el.get('id')}",
            "is_demo": False,
        })
    provenance.record("src.osm.overpass", "usable",
                      f"{len(out)} POIs around {locality} (r={radius}m)", records=len(out))
    print(f"[osm] {locality}: {len(out)} real POIs")
    return out
