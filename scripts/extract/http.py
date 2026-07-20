"""
scripts/extract/http.py — polite, robots-respecting fetch (stdlib only).

Every extractor that goes live MUST fetch through here. It:
  * checks robots.txt and refuses disallowed paths (open-source discipline),
  * sets an honest User-Agent that identifies Halo,
  * caches raw responses under data/raw/ as an audit trail,
  * rate-limits so we are a good citizen of small city sites.

Offline by default: extractors ship a committed seed and only call this with --live.
"""
from __future__ import annotations

import time
import urllib.request
import urllib.robotparser
from pathlib import Path
from urllib.parse import urlparse

USER_AGENT = "HaloVadodaraBot/0.1 (+https://halo.local; open-city-data; contact: founder)"
RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"
_LAST_HIT: dict[str, float] = {}
_MIN_INTERVAL = 2.0  # seconds between hits to the same host

_robots_cache: dict[str, urllib.robotparser.RobotFileParser] = {}


def _robots_ok(url: str) -> bool:
    host = urlparse(url).netloc
    if host not in _robots_cache:
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(f"{urlparse(url).scheme}://{host}/robots.txt")
        try:
            rp.read()
        except Exception:
            # If robots is unreachable, be conservative: allow only if we can't tell.
            rp = None  # type: ignore
        _robots_cache[host] = rp  # type: ignore
    rp = _robots_cache[host]
    return True if rp is None else rp.can_fetch(USER_AGENT, url)


def _rate_limit(host: str) -> None:
    last = _LAST_HIT.get(host, 0.0)
    wait = _MIN_INTERVAL - (time.time() - last)
    if wait > 0:
        time.sleep(wait)
    _LAST_HIT[host] = time.time()


def fetch(url: str, cache_key: str | None = None, timeout: int = 20) -> str | None:
    """
    Fetch a URL as text, honouring robots.txt and rate limits.
    Returns None (never raises) if disallowed or on error — extractors fall back
    to their committed seed so the pipeline never hard-fails on a flaky source.
    """
    if not _robots_ok(url):
        print(f"[http] robots.txt disallows {url} — skipping (as designed).")
        return None
    host = urlparse(url).netloc
    _rate_limit(host)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8", errors="replace")
    except Exception as exc:  # noqa: BLE001
        print(f"[http] fetch failed for {url}: {exc}")
        return None
    if cache_key:
        RAW_DIR.mkdir(parents=True, exist_ok=True)
        (RAW_DIR / cache_key).write_text(body, encoding="utf-8")
    return body
