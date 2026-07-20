"""
scripts/extract/services_osm.py — REAL OpenStreetMap client (config-driven).

Per locality:
  Nominatim geocode -> centre lat/lon
  Overpass "around:radius" -> every shop/amenity near it (real names, cats,
  coords, sometimes phone). Radius + endpoints come from halo_config.json.

RESILIENCE (why the whole source no longer goes red on one miss):
  A single locality that fails to geocode (e.g. Nominatim has no match) is
  SKIPPED and logged — we keep going with the others. The source ledger is
  written ONCE, at the end, from the aggregate outcome:
    * any locality returned POIs      -> usable   (or partial, if some failed)
    * none returned, but network fine -> partial  (coverage gap, not a block)
    * none returned due to network/HTTP/CAPTCHA errors -> blocked
  So `src.osm.overpass` is only "blocked" when OSM is genuinely unreachable.

>>> TO GO LIVE ON YOUR OWN MACHINE <<<
  Set runtime.allow_network=true in halo_config.json (or env HALO_ALLOW_NETWORK=1).
  For city-scale runs, self-host Overpass/Nominatim and point the *_url config at
  localhost (see osm.self_host_note). In the sandbox this returns [] and the
  extractor falls back to the labelled demo fixture.
"""
from __future__ import annotations

import json
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import config, provenance          # noqa: E402
from scripts.extract.fetcher import Fetcher   # noqa: E402

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


# --- geocode: distinguish "no match" (empty) from "couldn't reach" (error) ---
def geocode(locality: str) -> tuple[tuple[float, float] | None, str]:
    """Return (coords_or_None, status) where status in {'ok','empty','error'}."""
    base = config.get("osm", "nominatim_url")
    q = urllib.parse.urlencode({"q": f"{locality}, Vadodara, Gujarat, India",
                                "format": "json", "limit": 1})
    res = _f().get(f"{base}?{q}")
    if not res.ok:
        return None, "error"          # network / HTTP / blocked
    try:
        arr = json.loads(res.text)
    except Exception:  # noqa: BLE001
        return None, "error"
    if not arr:
        return None, "empty"          # healthy response, just no match
    return (float(arr[0]["lat"]), float(arr[0]["lon"])), "ok"


def _overpass(locality: str, lat: float, lon: float) -> tuple[list[dict], str]:
    """Return (records, status) where status in {'ok','empty','error'}."""
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
        return [], "error"
    try:
        elements = json.loads(res.text).get("elements", [])
    except Exception:  # noqa: BLE001
        return [], "error"

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
    return out, ("ok" if out else "empty")


def fetch_locality(locality: str) -> tuple[list[dict], str]:
    """
    Fetch POIs for ONE locality. Returns (records, outcome) and does NOT touch
    the ledger — the caller (fetch_localities) aggregates. outcome is one of
    'ok' | 'empty' | 'error'.
    """
    coords, gstatus = geocode(locality)
    if gstatus == "error":
        print(f"[osm] {locality}: geocode network/HTTP error — skipping")
        return [], "error"
    if gstatus == "empty":
        print(f"[osm] {locality}: no Nominatim match — skipping")
        return [], "empty"
    lat, lon = coords  # type: ignore[misc]
    records, ostatus = _overpass(locality, lat, lon)
    if ostatus == "error":
        print(f"[osm] {locality}: Overpass error — skipping")
        return [], "error"
    print(f"[osm] {locality}: {len(records)} real POIs")
    return records, ostatus


def fetch_localities(localities: list[str]) -> list[dict]:
    """
    Fetch POIs across MANY localities, skipping failures, and write ONE honest
    ledger entry for src.osm.overpass based on the aggregate outcome.
    """
    if not config.network_allowed():
        provenance.record("src.osm.overpass", "network_disabled",
                          "allow_network=false (sandbox); using fixtures")
        return []

    all_records: list[dict] = []
    ok = empty = error = 0
    failed_localities: list[str] = []

    for loc in localities:
        records, outcome = fetch_locality(loc)
        all_records.extend(records)
        if outcome == "ok":
            ok += 1
        elif outcome == "empty":
            empty += 1
            failed_localities.append(f"{loc}(no-data)")
        else:
            error += 1
            failed_localities.append(f"{loc}(net-err)")

    # --- decide the ONE aggregate status ---
    total = len(localities)
    if ok > 0:
        status = "usable" if (empty == 0 and error == 0) else "partial"
    elif error > 0:
        status = "blocked"        # nothing worked AND network/HTTP errors present
    else:
        status = "partial"        # nothing found, but network was healthy (gap, not block)

    note = (f"{ok}/{total} localities usable, {len(all_records)} POIs "
            f"(empty={empty}, errors={error})")
    if failed_localities:
        note += " · skipped: " + ", ".join(failed_localities[:12])
    provenance.record("src.osm.overpass", status, note, records=len(all_records))
    print(f"[osm] aggregate: {status} — {note}")
    return all_records
