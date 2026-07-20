"""
scripts/extract/wikidata_client.py — REAL structured data from Wikidata (open).

Wikidata is a free, CC0 knowledge base. Its SPARQL endpoint lets us pull every
item with coordinates within N km of Vadodara — schools, temples, monuments,
hospitals, companies, lakes — WITH an English label, a one-line description, its
type, and often an official website. This adds the "deep" detail OSM lacks
(descriptions + provenance), fully legally.

Endpoint: https://query.wikidata.org/sparql (JSON). No key; identify via UA.
"""
from __future__ import annotations

import json
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import config, provenance                       # noqa: E402
from scripts.extract.fetcher import Fetcher                 # noqa: E402
from scripts.extract.services_osm import load_area_coords, nearest_locality  # noqa: E402

ENDPOINT = "https://query.wikidata.org/sparql"

# map common Wikidata type labels -> Halo categories (best-effort; else keep label)
TYPE_MAP = {
    "hindu temple": "temple", "temple": "temple", "place of worship": "temple",
    "mosque": "temple", "church": "temple",
    "university": "education", "college": "education", "school": "education",
    "hospital": "health", "museum": "museum", "palace": "heritage",
    "fort": "fort", "monument": "heritage", "lake": "lake_dam", "reservoir": "lake_dam",
    "dam": "lake_dam", "garden": "park", "park": "park", "railway station": "transport",
    "company": "office", "bank": "finance", "hotel": "hospitality",
}


def _sparql(center_lat: float, center_lon: float, radius_km: float, limit: int) -> str:
    return f"""
SELECT ?item ?itemLabel ?itemDescription ?typeLabel ?website ?lat ?lon WHERE {{
  SERVICE wikibase:around {{
    ?item wdt:P625 ?loc .
    bd:serviceParam wikibase:center "Point({center_lon} {center_lat})"^^geo:wktLiteral .
    bd:serviceParam wikibase:radius "{radius_km}" .
  }}
  OPTIONAL {{ ?item wdt:P31 ?type. }}
  OPTIONAL {{ ?item wdt:P856 ?website. }}
  ?item p:P625/psv:P625 ?cn. ?cn wikibase:geoLatitude ?lat; wikibase:geoLongitude ?lon.
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,gu". }}
}} LIMIT {limit}
"""


def fetch_wikidata_places() -> list[dict]:
    if not config.network_allowed():
        provenance.record("src.wikidata", "network_disabled", "allow_network=false")
        return []
    lat = float(config.get("wikidata", "center_lat", default=22.3072))
    lon = float(config.get("wikidata", "center_lon", default=73.1812))
    radius = float(config.get("wikidata", "radius_km", default=25))
    limit = int(config.get("wikidata", "limit", default=2000))

    q = _sparql(lat, lon, radius, limit)
    url = f"{ENDPOINT}?{urllib.parse.urlencode({'query': q, 'format': 'json'})}"
    res = Fetcher().get(url, respect_robots=False, min_delay=2.0, timeout=90)
    if not res.ok:
        provenance.record("src.wikidata", "blocked" if res.blocked else "partial", res.reason)
        return []
    try:
        rows = json.loads(res.text)["results"]["bindings"]
    except Exception:  # noqa: BLE001
        provenance.record("src.wikidata", "partial", "unparseable SPARQL JSON")
        return []

    coords = load_area_coords()
    by_item: dict[str, dict] = {}
    for r in rows:
        item = r.get("item", {}).get("value", "")
        name = r.get("itemLabel", {}).get("value", "")
        if not item or not name or name.startswith("Q"):   # skip unlabelled Q-ids
            continue
        try:
            plat = float(r["lat"]["value"]); plon = float(r["lon"]["value"])
        except Exception:  # noqa: BLE001
            continue
        typ = r.get("typeLabel", {}).get("value", "").lower()
        cat = TYPE_MAP.get(typ, typ or "place")
        if item not in by_item:
            by_item[item] = {
                "name": name, "category": cat,
                "description": r.get("itemDescription", {}).get("value", ""),
                "address": "", "locality": nearest_locality(plat, plon, coords),
                "phone": "", "website": r.get("website", {}).get("value", ""),
                "opening_hours": "", "attributes": {"wikidata_type": typ} if typ else {},
                "external_rating": None, "review_count": None, "last_review_days": None,
                "permanently_closed": False, "coordinates": {"lat": plat, "lon": plon},
                "source_platform": "wikidata", "source_id": "src.wikidata",
                "source_link": item, "is_demo": False,
            }
    out = list(by_item.values())
    provenance.record("src.wikidata", "usable" if out else "partial",
                      f"{len(out)} items within {radius:.0f} km of Vadodara", records=len(out))
    print(f"[wikidata] {len(out)} structured places")
    return out
