"""
scripts/extract/directory_client.py — generic, polite business-directory crawler.

This is the FRAMEWORK for pulling services from local directories (Justdial,
Sulekha, VadodaraOnline, ...). It does the hard, boring, correct parts:

  * robots FIRST — the Fetcher reads robots.txt and refuses Disallowed paths and
    honours Crawl-delay before any page is fetched.
  * LOOPS the way the spec asks: for each enabled source -> each locality ->
    each category -> page 1..max_pages, stopping a query when a page yields no
    cards, and stopping a whole source the moment it returns 403/429/CAPTCHA.
  * THROTTLES between requests (per-host Crawl-delay / config delay).
  * RECORDS every source's fate in the ledger (usable/partial/blocked/...).

What YOU customise per site (the only site-specific part):
  `parse_cards()` — turn one results page's HTML into rows. The stub below uses
  a naive regex so the framework runs; REPLACE it with real selectors (bs4) for
  each site you enable. Each source in halo_config.json starts enabled=false —
  turn one on only after reading its robots.txt and terms.

In the sandbox (allow_network=false) nothing is fetched; the ledger shows
network_disabled and the extractor uses the labelled demo fixture instead.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from halo import config, provenance          # noqa: E402
from scripts.extract.fetcher import Fetcher      # noqa: E402

# Broad category set to loop over. Trim/extend per your dataset.
DEFAULT_CATEGORIES = ["food", "health", "electrician", "grocery", "salon",
                      "hardware", "auto", "electronics"]


def parse_cards(html: str, source_id: str, locality: str, category: str) -> list[dict]:
    """
    STUB parser — REPLACE per site with real HTML selectors (bs4/lxml).
    Returns a list of raw service dicts. Here we do a deliberately conservative
    regex pass so the loop is demonstrable without pretending to understand a
    specific site's markup.
    """
    rows: list[dict] = []
    # Example pattern: <div class="listing"> ... <h2>NAME</h2> ... tel:PHONE ...
    for block in re.findall(r'<div class="listing".*?</div>', html, flags=re.S | re.I):
        name = re.search(r"<h2[^>]*>(.*?)</h2>", block, flags=re.S | re.I)
        phone = re.search(r'tel:([+\d\s-]{6,})', block)
        rating = re.search(r'rating["\s:>]+([\d.]+)', block, flags=re.I)
        if not name:
            continue
        rows.append({
            "locality": locality, "category": category,
            "name": re.sub(r"<[^>]+>", "", name.group(1)).strip(),
            "description": "", "address": locality,
            "phone": phone.group(1).strip() if phone else "",
            "external_rating": float(rating.group(1)) if rating else None,
            "review_count": None, "last_review_days": None,
            "permanently_closed": False,
            "source_platform": source_id, "source_link": "", "is_demo": False,
        })
    return rows


def crawl_source(src: dict, localities: list[str], categories: list[str],
                 fetcher: Fetcher) -> list[dict]:
    sid = src["source_id"]
    template = src["base_url"]
    max_pages = int(config.get("directories", "max_pages_per_query", default=20))
    collected: list[dict] = []
    saw_block = saw_ok = False

    for locality in localities:
        for category in categories:
            for page in range(1, max_pages + 1):
                url = (template.replace("{locality}", locality.replace(" ", "-").lower())
                       .replace("{category}", category)
                       .replace("{page}", str(page)))
                res = fetcher.get(url)
                if res.reason == "network_disabled":
                    provenance.record(sid, "network_disabled",
                                      "allow_network=false; using fixtures")
                    return []
                if res.reason == "robots_disallowed":
                    provenance.record(sid, "robots_disallowed", f"robots blocks {url}")
                    return collected
                if res.blocked:
                    saw_block = True
                    provenance.record(sid, "partial" if saw_ok else "blocked",
                                      f"{res.reason} at page {page} ({locality}/{category})")
                    return collected   # stop this source entirely; be a good citizen
                if not res.ok:
                    break              # transient — move to next query
                cards = parse_cards(res.text, sid, locality, category)
                if not cards:
                    break              # no more results -> stop paginating
                collected.extend(cards)
                saw_ok = True
    provenance.record(sid, "partial" if saw_block else "usable",
                      f"{len(collected)} listings across {len(localities)} localities",
                      records=len(collected))
    return collected


def fetch_directories(localities: list[str], categories: list[str] | None = None) -> list[dict]:
    categories = categories or DEFAULT_CATEGORIES
    sources = [s for s in config.get("directories", "sources", default=[]) if s.get("enabled")]
    if not sources:
        print("[directories] no sources enabled in halo_config.json (expected until "
              "you read each site's robots.txt and enable it).")
        return []
    fetcher = Fetcher()
    out: list[dict] = []
    for src in sources:
        out.extend(crawl_source(src, localities, categories, fetcher))
    return out
