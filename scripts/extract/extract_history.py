#!/usr/bin/env python3
"""
Phase 2 extractor — HISTORY / KNOWLEDGE of Vadodara (books, articles, wiki).

Sources (all open):
  * en.wikipedia + gu.wikipedia (MediaWiki API)
  * Archive.org public-domain books about Vadodara/Baroda

Gujarati text is translated gu->en via halo.translate (LibreTranslate/Argos);
if no engine is available the original is kept verbatim and flagged
needs_translation (never fabricated). Every record keeps its source link + the
original text, so meaning can always be re-checked.

NO fixtures / NO demo data — offline this writes 0 rows and records the honest
reason. Run live:  HALO_ALLOW_NETWORK=1 python scripts/extract/extract_history.py
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import config, provenance, translate   # noqa: E402
from halo.models import HistoryDoc                 # noqa: E402
from halo.util import make_id, now_iso             # noqa: E402

OUT = ROOT / "data" / "processed" / "history.json"

ERA_KEYWORDS = {
    "Chalukya era": ["chalukya", "solanki"],
    "Sultanate": ["sultanate", "muzaffarid", "gujarat sultan"],
    "Mughal era": ["mughal", "aurangzeb", "akbar"],
    "Maratha / Gaekwad era": ["maratha", "gaekwad", "gaikwad", "peshwa"],
    "British Raj": ["british", "raj", "residency", "east india company"],
    "Post-independence": ["independence", "1947", "republic", "gujarat state"],
}


def detect_period(text: str) -> str:
    t = text.lower()
    for era, kws in ERA_KEYWORDS.items():
        if any(k in t for k in kws):
            return era
    years = re.findall(r"\b(1[4-9]\d\d|20[0-2]\d)\b", text)
    return years[0] if years else ""


def detect_tags(text: str) -> list[str]:
    t = text.lower()
    tags = []
    for tag, kws in {
        "dynasty": ["gaekwad", "gaikwad", "dynasty", "maharaja", "king", "ruler"],
        "architecture": ["palace", "fort", "gate", "building", "temple", "vav", "stepwell"],
        "culture": ["music", "art", "festival", "literature", "university"],
        "geography": ["river", "vishwamitri", "lake", "district", "taluka"],
        "governance": ["municipal", "administration", "state", "reform"],
    }.items():
        if any(k in t for k in kws):
            tags.append(tag)
    return tags or ["history"]


def to_doc(raw: dict) -> dict:
    text = raw["text"]
    lang = raw.get("lang", "en")
    summary, engine, ok = translate.translate(text, lang)
    h = HistoryDoc(
        title=raw["title"],
        summary=summary[:1200],
        original_text=text[:4000],
        original_language=lang,
        translated=(lang != "en" and ok),
        translation_engine=engine,
        needs_translation=(lang != "en" and not ok),
        period=detect_period(text),
        tags=detect_tags(text),
        source_type=raw.get("source_type", "wiki"),
        topic="history",
        source_links=[raw["url"]] if raw.get("url") else [],
        source_ids=[f"src.{raw.get('source_type','wiki')}"],
        confidence=0.6, needs_review=True,
    )
    d = h.to_dict()
    d["id"] = make_id("hist", raw["title"], text[:60])
    return d


def main() -> None:
    ap = argparse.ArgumentParser(description="Extract Vadodara HISTORY/knowledge.")
    ap.add_argument("--live", action="store_true")
    args = ap.parse_args()

    raw: list[dict] = []
    if args.live and config.network_allowed():
        from scripts.extract.knowledge_client import fetch_wiki, fetch_archive_books
        raw += fetch_wiki(config.get("history", "wiki_pages_en", default=[]),
                          config.get("history", "wiki_pages_gu", default=[]))
        raw += fetch_archive_books(config.get("history", "archive_query", default="Vadodara"),
                                   int(config.get("history", "archive_max_items", default=25)))
    else:
        provenance.record("src.wiki", "network_disabled",
                          "allow_network/--live off — history needs live sources (no demo)")
        print("[history] no live sources (needs --live + HALO_ALLOW_NETWORK=1); 0 rows")

    docs = [to_doc(r) for r in raw]
    translated = sum(1 for d in docs if d["translated"])
    untranslated = sum(1 for d in docs if d["needs_translation"])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(docs, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[history] wrote {len(docs)} docs "
          f"({translated} translated, {untranslated} awaiting translation) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
