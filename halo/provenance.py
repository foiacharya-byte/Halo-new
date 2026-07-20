"""
halo/provenance.py — the SOURCE LEDGER.

Every fetch attempt records here WHAT happened to each source, so the dataset
honestly reflects where coverage came from. Extractors run as separate
processes, so the ledger is a small JSON file we read-modify-write.

Status vocabulary (plain meanings):
  usable            fetched fine, data parsed
  partial           some pages worked, others blocked/failed
  blocked           403 / 429 / CAPTCHA — we backed off and stopped this source
  robots_disallowed robots.txt told us not to; we obeyed
  network_disabled  runtime.allow_network is false (sandbox) — never attempted
  fixture           served labelled demo data instead of the real source
"""
from __future__ import annotations

import json
from pathlib import Path

from .util import now_iso

ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / "data" / "processed" / "source_status.json"

ORDER = ["usable", "partial", "blocked", "robots_disallowed", "network_disabled", "fixture"]
ICON = {"usable": "🟢", "partial": "🟡", "blocked": "🔴",
        "robots_disallowed": "⛔", "network_disabled": "🌐", "fixture": "🧪"}


def _read() -> dict:
    if LEDGER.exists():
        try:
            return json.loads(LEDGER.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            return {}
    return {}


def record(source_id: str, status: str, note: str = "", records: int | None = None) -> None:
    LEDGER.parent.mkdir(parents=True, exist_ok=True)
    data = _read()
    entry = data.get(source_id, {"attempts": 0, "records": 0})
    entry["attempts"] = entry.get("attempts", 0) + 1
    entry["status"] = status
    entry["note"] = note
    entry["last_checked"] = now_iso()
    if records is not None:
        entry["records"] = records
    data[source_id] = entry
    LEDGER.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def render_markdown() -> str:
    data = _read()
    rows = sorted(data.items(),
                  key=lambda kv: ORDER.index(kv[1].get("status", "fixture"))
                  if kv[1].get("status") in ORDER else 99)
    out = ["# Source status — where Halo's data really comes from",
           f"_Generated {now_iso()}_", "",
           "| source | status | records | note | last checked |",
           "|---|---|---|---|---|"]
    for sid, e in rows:
        st = e.get("status", "?")
        out.append(f"| `{sid}` | {ICON.get(st,'')} {st} | {e.get('records',0)} "
                   f"| {e.get('note','')} | {e.get('last_checked','')[:19]} |")
    if not rows:
        out.append("| _(no sources attempted yet)_ | | | | |")
    return "\n".join(out) + "\n"
