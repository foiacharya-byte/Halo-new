"""
scripts/extract/news_client.py — REAL news client (RSS/JSON first, HTML last).

Order of preference (cheapest + most robots-friendly first):
  1. RSS/Atom feeds  (config news.feeds, type="rss")
  2. JSON APIs       (type="json")
  3. HTML crawl      (type="html") — ONLY if robots.txt allows (Fetcher enforces)

It pulls items, keeps those within news.date_from..date_to (so we can sweep the
2025-26 window), and returns raw news dicts. Feeds/date-range live in
halo_config.json. Everything is recorded in the source ledger.

Sandbox: allow_network=false -> returns [] (ledger: network_disabled); the
extractor uses the labelled demo fixture.

>>> TO GO LIVE <<<  set allow_network=true (or HALO_ALLOW_NETWORK=1). Confirm
each feed URL in halo_config.json is current for the publisher's Vadodara section.
"""
from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import config, provenance          # noqa: E402
from scripts.extract.fetcher import Fetcher      # noqa: E402


def _parse_date(raw: str) -> str | None:
    if not raw:
        return None
    try:
        return parsedate_to_datetime(raw).date().isoformat()   # RFC822 (RSS)
    except Exception:  # noqa: BLE001
        pass
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).date().isoformat()  # ISO/Atom
    except Exception:  # noqa: BLE001
        return None


def _in_window(date_iso: str | None, lo: str, hi: str) -> bool:
    return bool(date_iso and lo <= date_iso <= hi)


def _parse_rss(xml_text: str, source_id: str, lo: str, hi: str) -> list[dict]:
    out: list[dict] = []
    try:
        root = ET.fromstring(xml_text)
    except Exception:  # noqa: BLE001
        return out
    # RSS <item> and Atom <entry>, namespace-agnostic via local-names
    for item in root.iter():
        tag = item.tag.split("}")[-1]
        if tag not in ("item", "entry"):
            continue
        get = lambda n: next((c.text for c in item if c.tag.split("}")[-1] == n and c.text), "")  # noqa: E731
        link = get("link") or ""
        for c in item:
            if c.tag.split("}")[-1] == "link" and c.get("href"):
                link = c.get("href")
        date = _parse_date(get("pubDate") or get("published") or get("updated") or get("date"))
        if not _in_window(date, lo, hi):
            continue
        out.append({
            "title": (get("title") or "").strip(),
            "summary": (get("description") or get("summary") or "").strip()[:500],
            "date": date, "link": link.strip(), "source_id": source_id,
            "source_platform": source_id, "is_demo": False,
        })
    return out


def _parse_json(text: str, source_id: str, lo: str, hi: str) -> list[dict]:
    out: list[dict] = []
    try:
        data = json.loads(text)
    except Exception:  # noqa: BLE001
        return out
    items = data if isinstance(data, list) else data.get("articles", data.get("items", []))
    for it in items:
        date = _parse_date(str(it.get("publishedAt") or it.get("date") or ""))
        if not _in_window(date, lo, hi):
            continue
        out.append({
            "title": (it.get("title") or "").strip(),
            "summary": (it.get("description") or it.get("summary") or "").strip()[:500],
            "date": date, "link": it.get("url") or it.get("link") or "",
            "source_id": source_id, "source_platform": source_id, "is_demo": False,
        })
    return out


def fetch_news() -> list[dict]:
    if not config.network_allowed():
        provenance.record("src.news.feeds", "network_disabled",
                          "allow_network=false (sandbox); using fixtures")
        return []

    lo = config.get("news", "date_from", default="2025-01-01")
    hi = config.get("news", "date_to", default="2026-12-31")
    feeds = config.get("news", "feeds", default=[])
    fetcher = Fetcher()
    out: list[dict] = []
    for feed in feeds:
        sid, url, ftype = feed["source_id"], feed["url"], feed.get("type", "rss")
        if ftype == "html" and not feed.get("allow_html_crawl"):
            provenance.record(sid, "robots_disallowed", "html crawl not permitted by config")
            continue
        res = fetcher.get(url, cache_key=f"news_{sid}.xml")
        if not res.ok:
            provenance.record(sid, "blocked" if res.blocked else "partial", res.reason)
            continue
        if ftype == "json":
            items = _parse_json(res.text, sid, lo, hi)
        else:  # rss/atom (and html-as-feed best effort)
            items = _parse_rss(res.text, sid, lo, hi)
        provenance.record(sid, "usable", f"{len(items)} items in {lo}..{hi}", records=len(items))
        out.extend(items)
    return out
