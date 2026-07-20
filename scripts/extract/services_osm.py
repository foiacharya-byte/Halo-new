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
_warned_ua = False


def _f() -> Fetcher:
    global _fetcher
    if _fetcher is None:
        _fetcher = Fetcher()
    return _fetcher


def _respect_robots() -> bool:
    return bool(config.get("osm", "respect_robots", default=False))


def blocked_hint() -> None:
    """Printed once when every OSM call fails — the concrete things to check."""
    print(
        "[osm] ── All OSM calls failed. Most common causes (exact per-call reason is\n"
        "[osm]    printed above as 'failed — <reason>'):\n"
        "[osm]    1) Placeholder contact  -> set HALO_CONTACT_EMAIL=you@realdomain.com\n"
        "[osm]    2) No internet / proxy / firewall blocking *.openstreetmap.org\n"
        "[osm]    3) SSL cert verify error (common on Windows) -> `pip install certifi`\n"
        "[osm]       or ensure your system CA store is present\n"
        "[osm]    4) Rate-limited (429) -> raise osm.*_min_delay_seconds and retry\n"
        "[osm]    Tip: verify reachability first:\n"
        "[osm]      curl \"https://nominatim.openstreetmap.org/search?q=Alkapuri,Vadodara&format=json&limit=1\"")


def _warn_placeholder_ua() -> None:
    """Nominatim can 403 a generic/placeholder identity — warn once so it's fixable."""
    global _warned_ua
    if _warned_ua:
        return
    _warned_ua = True
    email = config.get("runtime", "contact_email", default="")
    if (not email) or "example.com" in email:
        print("[osm] ⚠ No real contact email set. Nominatim may 403 unidentified bulk use.\n"
              "      Set one:  HALO_CONTACT_EMAIL=you@realdomain.com  (or edit "
              "runtime.contact_email in halo_config.json).")


# --- geocode: distinguish "no match" (empty) from "couldn't reach" (error) ---
def geocode(locality: str) -> tuple[tuple[float, float] | None, str]:
    """Return (coords_or_None, status) where status in {'ok','empty','error'}."""
    _warn_placeholder_ua()
    base = config.get("osm", "nominatim_url")
    ndelay = float(config.get("osm", "nominatim_min_delay_seconds", default=1.0))
    email = config.get("runtime", "contact_email", default="")
    params = {"q": f"{locality}, Vadodara, Gujarat, India", "format": "json", "limit": 1}
    if email and "example.com" not in email:
        params["email"] = email          # Nominatim policy: identify bulk usage
    q = urllib.parse.urlencode(params)
    res = _f().get(f"{base}?{q}", respect_robots=_respect_robots(), min_delay=ndelay)
    if not res.ok:
        print(f"[osm] {locality}: nominatim failed — {res.reason}")
        return None, "error"          # network / HTTP / blocked
    try:
        arr = json.loads(res.text)
    except Exception:  # noqa: BLE001
        print(f"[osm] {locality}: nominatim returned unparseable body")
        return None, "error"
    if not arr:
        return None, "empty"          # healthy response, just no match
    return (float(arr[0]["lat"]), float(arr[0]["lon"])), "ok"


def _overpass(locality: str, lat: float, lon: float) -> tuple[list[dict], str]:
    """Return (records, status) where status in {'ok','empty','error'}."""
    radius = int(config.get("osm", "radius_m", default=1500))
    odelay = float(config.get("osm", "overpass_min_delay_seconds", default=3.0))
    endpoints = [config.get("osm", "overpass_url")] + list(
        config.get("osm", "overpass_mirrors", default=[]))
    query = f"""
    [out:json][timeout:25];
    (
      node["shop"](around:{radius},{lat},{lon});
      node["amenity"~"restaurant|cafe|fast_food|clinic|doctors|dentist|pharmacy|hospital"](around:{radius},{lat},{lon});
    );
    out center 200;
    """
    data = urllib.parse.urlencode({"data": query})
    res = None
    for ep in endpoints:                     # try primary, then mirrors
        res = _f().get(f"{ep}?{data}", respect_robots=_respect_robots(), min_delay=odelay)
        if res.ok:
            break
        print(f"[osm] {locality}: overpass {ep.split('/')[2]} failed — {res.reason}")
    if not res or not res.ok:
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
    if status == "blocked":
        blocked_hint()
    return all_records
