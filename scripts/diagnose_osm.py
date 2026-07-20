#!/usr/bin/env python3
"""
scripts/diagnose_osm.py — one clean OSM reachability test.

Run this to see EXACTLY why OSM fails, using the same network stack as the
pipeline (so the reason is representative):

    # PowerShell:
    $env:HALO_ALLOW_NETWORK = 1
    $env:HALO_CONTACT_EMAIL = "you@realdomain.com"
    python scripts/diagnose_osm.py

It prints the config it's using, whether certifi is available, and the raw
FetchResult (ok / status / reason / bytes) for a single Nominatim call.
"""
from __future__ import annotations

import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from halo import config                       # noqa: E402
from scripts.extract.fetcher import Fetcher, _ssl_context  # noqa: E402


def main() -> None:
    print("=== Halo OSM diagnostic ===")
    print(f"allow_network : {config.network_allowed()}  "
          f"(env HALO_ALLOW_NETWORK / halo_config runtime.allow_network)")
    print(f"contact_email : {config.get('runtime', 'contact_email', default='')}")
    print(f"user_agent    : {config.user_agent()}")
    print(f"nominatim_url : {config.get('osm', 'nominatim_url')}")
    print(f"respect_robots: {config.get('osm', 'respect_robots', default=False)}")
    try:
        import certifi
        print(f"certifi       : installed -> {certifi.where()}")
    except Exception:  # noqa: BLE001
        print("certifi       : NOT installed (Windows SSL failures? `pip install certifi`)")
    print(f"ssl_context   : {'certifi bundle' if _ssl_context() else 'system default'}")
    print()

    if not config.network_allowed():
        print("Network is OFF. Set HALO_ALLOW_NETWORK=1 and re-run.")
        return

    base = config.get("osm", "nominatim_url")
    q = urllib.parse.urlencode({"q": "Alkapuri, Vadodara, Gujarat, India",
                                "format": "json", "limit": 1})
    url = f"{base}?{q}"
    print(f"GET {url}")
    res = Fetcher().get(url, respect_robots=False, min_delay=1.0)
    print(f"\nRESULT: ok={res.ok}  status={res.status}  blocked={res.blocked}")
    print(f"reason: {res.reason or '(none)'}")
    if res.ok:
        print(f"bytes : {len(res.text)}  (first 200 chars)")
        print(res.text[:200])
        print("\n✅ OSM is reachable — run:  python scripts/run_pipeline.py --live")
    else:
        print("\n❌ Not reachable. Likely fixes by reason:")
        print("  error:<...SSL...>       -> pip install certifi   (then re-run)")
        print("  error:<...403...>       -> set HALO_CONTACT_EMAIL; check proxy/firewall")
        print("  http_429                -> raise osm.*_min_delay_seconds")
        print("  error:<...proxy...>     -> set HTTPS_PROXY / HTTP_PROXY for your network")
        print("  error:<...timed out...> -> firewall/VPN blocking openstreetmap.org")


if __name__ == "__main__":
    main()
