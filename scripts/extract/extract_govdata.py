#!/usr/bin/env python3
"""
Phase 2 extractor — data.gov.in (official Open Government Data API).

The legitimate route to registry/census/statistics depth for Vadodara. It's
paginated JSON, so it's clean and reliable — no scraping.

Setup (one-time):
  1. Register free at https://data.gov.in and generate an API key.
  2. Set it:  HALO_DATAGOV_KEY=xxxxx   (or govdata.api_key in halo_config.json)
  3. Find datasets on data.gov.in (search "Vadodara"/"Gujarat"), copy each
     resource UUID into govdata.resource_ids in halo_config.json.
  4. Run:  python scripts/extract/extract_govdata.py

Each resource's rows are saved raw to data/processed/govdata_<id>.json so you can
inspect the columns before mapping them into AREA/SERVICE records. Everything is
recorded in the source ledger.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import config, provenance          # noqa: E402
from scripts.extract.fetcher import Fetcher   # noqa: E402

PROC = ROOT / "data" / "processed"


def fetch_resource(rid: str, key: str, fetcher: Fetcher) -> list[dict]:
    base = config.get("govdata", "api_base", default="https://api.data.gov.in/resource/")
    page = int(config.get("govdata", "page_size", default=100))
    cap = int(config.get("govdata", "max_records", default=5000))
    out: list[dict] = []
    offset = 0
    while offset < cap:
        url = f"{base}{rid}?api-key={key}&format=json&limit={page}&offset={offset}"
        res = fetcher.get(url, respect_robots=False, min_delay=1.0)
        if not res.ok:
            provenance.record(f"src.datagov.{rid[:8]}",
                              "blocked" if res.blocked else "partial", res.reason)
            break
        try:
            recs = json.loads(res.text).get("records", [])
        except Exception:  # noqa: BLE001
            provenance.record(f"src.datagov.{rid[:8]}", "partial", "unparseable JSON")
            break
        if not recs:
            break
        out.extend(recs)
        offset += len(recs)
        if len(recs) < page:
            break
    return out


def main() -> None:
    key = config.get("govdata", "api_key", default="")
    resources = config.get("govdata", "resource_ids", default=[])

    if not config.network_allowed():
        print("[govdata] network disabled — set HALO_ALLOW_NETWORK=1 to run.")
        return
    if not key:
        provenance.record("src.datagov", "needs_key",
                          "no API key — set HALO_DATAGOV_KEY (free at data.gov.in)")
        print("[govdata] No API key. Get a free one at https://data.gov.in and set "
              "HALO_DATAGOV_KEY, then list resource_ids in halo_config.json.")
        return
    if not resources:
        print("[govdata] No resource_ids configured. Add dataset UUIDs from "
              "data.gov.in to govdata.resource_ids in halo_config.json.")
        return

    fetcher = Fetcher()
    for rid in resources:
        rows = fetch_resource(rid, key, fetcher)
        out = PROC / f"govdata_{rid[:12]}.json"
        out.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
        provenance.record(f"src.datagov.{rid[:8]}", "usable" if rows else "partial",
                          f"{len(rows)} rows", records=len(rows))
        print(f"[govdata] {rid[:12]}: {len(rows)} rows -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
