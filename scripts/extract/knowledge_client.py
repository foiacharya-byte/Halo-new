"""
scripts/extract/knowledge_client.py — REAL open sources for Vadodara knowledge.

  * MediaWiki API (en.wikipedia + gu.wikipedia): open JSON, no key. We pull the
    plain-text extract of each configured page and split it into paragraphs.
    Gujarati pages are returned as-is (lang='gu') for the extractor to translate.
  * Archive.org: open API for public-domain BOOKS about Vadodara/Baroda — we
    capture each book's title/year/language/description with a link.

All fetches go through the resilient Fetcher (retries, mirrors n/a, honest
ledger). Nothing here fabricates content.
"""
from __future__ import annotations

import json
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import provenance                    # noqa: E402
from scripts.extract.fetcher import Fetcher     # noqa: E402

_fetcher: Fetcher | None = None


def _f() -> Fetcher:
    global _fetcher
    if _fetcher is None:
        _fetcher = Fetcher()
    return _fetcher


def _paragraphs(text: str, min_len: int = 120) -> list[str]:
    out = []
    for para in (text or "").split("\n"):
        p = para.strip()
        if len(p) >= min_len and not p.startswith("=="):   # skip headings/short lines
            out.append(p)
    return out


def fetch_wiki_page(lang: str, title: str) -> list[dict]:
    """Return paragraph records for one wiki page. lang in {'en','gu',...}."""
    api = f"https://{lang}.wikipedia.org/w/api.php"
    params = {"action": "query", "prop": "extracts", "explaintext": "1",
              "redirects": "1", "format": "json", "titles": title}
    res = _f().get(f"{api}?{urllib.parse.urlencode(params)}", respect_robots=False, min_delay=1.0)
    if not res.ok:
        provenance.record(f"src.wiki.{lang}", "blocked" if res.blocked else "partial",
                          f"{title}: {res.reason}")
        return []
    try:
        pages = json.loads(res.text)["query"]["pages"]
    except Exception:  # noqa: BLE001
        return []
    out: list[dict] = []
    for page in pages.values():
        extract = page.get("extract", "")
        url = f"https://{lang}.wikipedia.org/wiki/{urllib.parse.quote(page.get('title', title))}"
        for para in _paragraphs(extract):
            out.append({"title": page.get("title", title), "text": para,
                        "lang": lang, "url": url, "source_type": "wiki"})
    return out


def fetch_wiki(pages_en: list[str], pages_gu: list[str]) -> list[dict]:
    out: list[dict] = []
    for t in pages_en:
        out.extend(fetch_wiki_page("en", t))
    for t in pages_gu:
        out.extend(fetch_wiki_page("gu", t))
    provenance.record("src.wiki", "usable" if out else "partial",
                      f"{len(out)} paragraphs from {len(pages_en)} en + {len(pages_gu)} gu pages",
                      records=len(out))
    return out


def fetch_archive_books(query: str, max_items: int = 25) -> list[dict]:
    """Public-domain books about Vadodara/Baroda from Archive.org (metadata)."""
    search = ("https://archive.org/advancedsearch.php?" + urllib.parse.urlencode({
        "q": f"({query}) AND mediatype:texts",
        "rows": max_items, "output": "json"}) +
        "&fl[]=identifier&fl[]=title&fl[]=year&fl[]=language&fl[]=description")
    res = _f().get(search, respect_robots=False, min_delay=1.0)
    if not res.ok:
        provenance.record("src.archive.books", "blocked" if res.blocked else "partial", res.reason)
        return []
    try:
        docs = json.loads(res.text)["response"]["docs"]
    except Exception:  # noqa: BLE001
        return []
    out = []
    for d in docs:
        desc = d.get("description", "")
        if isinstance(desc, list):
            desc = " ".join(desc)
        lang = d.get("language", "en")
        if isinstance(lang, list):
            lang = lang[0] if lang else "en"
        out.append({
            "title": d.get("title", d["identifier"]),
            "text": desc or d.get("title", ""),
            "lang": "gu" if str(lang).lower().startswith("guj") else "en",
            "url": f"https://archive.org/details/{d['identifier']}",
            "source_type": "book", "year": d.get("year", ""),
        })
    provenance.record("src.archive.books", "usable" if out else "partial",
                      f"{len(out)} books for '{query}'", records=len(out))
    return out
