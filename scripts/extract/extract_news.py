#!/usr/bin/env python3
"""
Phase 2 extractor — NEWS_EVENTS (floods, civic, crime, politics ...).

  live feeds (RSS/JSON/HTML) via news_client   [--live]
  else -> labelled demo fixture (is_demo=true)

For every article we derive, with simple rules (no external model needed):
  * tags        — keyword match (flood/crime/civic/politics/development/traffic)
  * locations   — match Vadodara AREA names/aliases mentioned in title+summary
  * sentiment   — naive positive/negative word lists (neutral by default)

Clustering + "confirmed" status happens in validate_news.py.

  python3 scripts/extract/extract_news.py            # demo fixture
  python3 scripts/extract/extract_news.py --live      # real feeds if allowed
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import provenance                          # noqa: E402
from halo.models import NewsEvent                     # noqa: E402
from halo.util import make_id, now_iso                # noqa: E402

OUT = ROOT / "data" / "processed" / "news_events.json"
DEMO = ROOT / "data" / "seed" / "news_demo.json"
AREAS = ROOT / "data" / "processed" / "areas.validated.json"

TAG_KEYWORDS = {
    "flood": ["flood", "waterlog", "rain", "monsoon", "inundat"],
    "crime": ["theft", "robbery", "murder", "assault", "police", "fraud", "crime"],
    "civic": ["vmc", "ward", "corporation", "municipal", "civic", "boundary", "tax"],
    "politics": ["bjp", "congress", "aap", "mla", "election", "minister", "protest"],
    "development": ["project", "flyover", "road", "metro", "development", "inaugurat"],
    "traffic": ["traffic", "accident", "jam", "signal"],
}
POS = ["approve", "inaugurat", "win", "award", "boost", "relief", "improve"]
NEG = ["flood", "theft", "crime", "accident", "protest", "waterlog", "murder", "fraud"]


def load_area_names() -> list[str]:
    if not AREAS.exists():
        return []
    names: list[str] = []
    for a in json.loads(AREAS.read_text(encoding="utf-8")):
        names.append(a["name"])
        names.extend(a.get("aliases", []))
    return names


def tag_article(text: str) -> list[str]:
    t = text.lower()
    return [tag for tag, kws in TAG_KEYWORDS.items() if any(k in t for k in kws)]


def find_locations(text: str, area_names: list[str]) -> list[str]:
    t = text.lower()
    found = {n for n in area_names if re.search(rf"\b{re.escape(n.lower())}\b", t)}
    return sorted(found)


def sentiment(text: str) -> str:
    t = text.lower()
    p, n = sum(w in t for w in POS), sum(w in t for w in NEG)
    return "positive" if p > n else "negative" if n > p else "neutral"


def to_event(raw: dict, area_names: list[str]) -> dict:
    text = f"{raw.get('title','')} {raw.get('summary','')}"
    ev = NewsEvent(
        title=raw.get("title", ""),
        short_summary=raw.get("summary", "")[:280],
        date=raw.get("date", ""),
        tags=tag_article(text),
        locations_involved=find_locations(text, area_names),
        sentiment=sentiment(text),
        status="reported",
        source_links=[raw["link"]] if raw.get("link") else [],
        source_ids=[raw.get("source_id", "src.seed.curated")],
        confidence=0.5, needs_review=True,
    )
    d = ev.to_dict()
    d["is_demo"] = bool(raw.get("is_demo", False))
    d["id"] = make_id("news", raw.get("title", ""), raw.get("date", ""))
    return d


def main() -> None:
    ap = argparse.ArgumentParser(description="Extract Vadodara NEWS.")
    ap.add_argument("--live", action="store_true", help="try live feeds first")
    args = ap.parse_args()

    raw: list[dict] = []
    if args.live:
        from scripts.extract.news_client import fetch_news
        raw = fetch_news()
    if not raw:
        recs = json.loads(DEMO.read_text(encoding="utf-8"))["records"]
        raw = [{**r, "is_demo": True} for r in recs]
        provenance.record("src.news.feeds", "fixture",
                          f"served {len(raw)} demo news records "
                          f"({'network disabled' if not args.live else 'feeds empty/blocked'})",
                          records=len(raw))
        print(f"[news] {len(raw)} via labelled demo fixture")

    area_names = load_area_names()
    events = [to_event(r, area_names) for r in raw]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(events, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[news] wrote {len(events)} events "
          f"({sum(e['is_demo'] for e in events)} demo) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
