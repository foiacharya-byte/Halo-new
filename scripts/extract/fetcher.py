"""
scripts/extract/http.py — the robust, polite, robots-respecting fetch client.

Every live extractor fetches through Fetcher. It:
  * OBEYS the network switch — if runtime.allow_network is false (sandbox), it
    never touches the network and returns reason="network_disabled".
  * READS robots.txt per host and honours User-agent/Disallow + Crawl-delay.
  * THROTTLES per host (max of config delay and the site's Crawl-delay).
  * DETECTS blocks — HTTP 403/429 or a CAPTCHA-looking body — then backs off and
    marks the host blocked so we stop hammering it.
  * CACHES raw bodies under data/raw/ as an audit trail.

It returns a FetchResult (never raises) so extractors can fall back cleanly.
"""
from __future__ import annotations

import ssl
import sys
import time
import urllib.request
import urllib.robotparser
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from halo import config  # noqa: E402

RAW_DIR = ROOT / "data" / "raw"
CAPTCHA_MARKERS = ("captcha", "are you a robot", "unusual traffic",
                   "verify you are human", "access denied", "cf-challenge")


def _ssl_context() -> ssl.SSLContext | None:
    """
    Prefer certifi's CA bundle if installed — fixes the common Windows
    'SSL: CERTIFICATE_VERIFY_FAILED' where Python can't find the system roots.
    Falls back to the default context (None) when certifi isn't present.
    """
    try:
        import certifi  # optional dependency
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:  # noqa: BLE001
        return None


@dataclass
class FetchResult:
    ok: bool
    status: int = 0
    text: str = ""
    blocked: bool = False
    reason: str = ""       # "", network_disabled, robots_disallowed, http_403,
    #                        http_429, captcha, error


class Fetcher:
    """One Fetcher per crawl run; keeps per-host robots + block state."""

    def __init__(self) -> None:
        self._robots_cache: dict[str, urllib.robotparser.RobotFileParser | None] = {}
        self._last_hit: dict[str, float] = {}
        self._blocked_hosts: set[str] = set()
        self.ua = config.user_agent()
        self.default_delay = float(config.get("runtime", "default_delay_seconds", default=2.0))
        self.max_retries = int(config.get("runtime", "max_retries", default=3))
        self.backoff_base = float(config.get("runtime", "backoff_base_seconds", default=4.0))
        self._ssl = _ssl_context()

    # -- robots ------------------------------------------------------------
    def _robots(self, url: str) -> urllib.robotparser.RobotFileParser | None:
        host = urlparse(url).netloc
        if host not in self._robots_cache:
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(f"{urlparse(url).scheme}://{host}/robots.txt")
            try:
                rp.read()
            except Exception:  # noqa: BLE001
                rp = None
            self._robots_cache[host] = rp
        return self._robots_cache[host]

    def _allowed(self, url: str) -> bool:
        rp = self._robots(url)
        return True if rp is None else rp.can_fetch(self.ua, url)

    def _crawl_delay(self, url: str) -> float:
        rp = self._robots(url)
        if rp is None:
            return self.default_delay
        try:
            cd = rp.crawl_delay(self.ua)
        except Exception:  # noqa: BLE001
            cd = None
        return max(self.default_delay, float(cd) if cd else 0.0)

    def _throttle(self, host: str, delay: float) -> None:
        wait = delay - (time.time() - self._last_hit.get(host, 0.0))
        if wait > 0:
            time.sleep(wait)
        self._last_hit[host] = time.time()

    # -- fetch -------------------------------------------------------------
    def get(self, url: str, cache_key: str | None = None, timeout: int = 25,
            respect_robots: bool = True, min_delay: float | None = None) -> FetchResult:
        """
        Fetch a URL. For crawlable HTML (directories, news pages) keep
        respect_robots=True. For DOCUMENTED PUBLIC APIs (Nominatim, Overpass)
        pass respect_robots=False: robots.txt governs crawlers of HTML pages, not
        API clients — we instead honour the API's usage policy via min_delay
        (rate limit) + an identifying User-Agent. Never raises.
        """
        if not config.network_allowed():
            return FetchResult(ok=False, reason="network_disabled")

        host = urlparse(url).netloc
        if host in self._blocked_hosts:
            return FetchResult(ok=False, blocked=True, reason="host_blocked_earlier")
        if respect_robots and not self._allowed(url):
            return FetchResult(ok=False, reason="robots_disallowed")

        delay = self.default_delay
        if respect_robots:
            delay = max(delay, self._crawl_delay(url))
        if min_delay:
            delay = max(delay, float(min_delay))

        # 429 = rate-limited, 5xx = server overloaded — BOTH transient (common on
        # public Overpass). Retry with backoff, honour Retry-After, and NEVER
        # permanently ban the host for these (only a 403 is a real ban). This is
        # what lets a tiled city scrape keep using the fast primary server.
        transient = {429, 500, 502, 503, 504}
        for attempt in range(self.max_retries):
            self._throttle(host, delay)
            req = urllib.request.Request(url, headers={"User-Agent": self.ua})
            try:
                with urllib.request.urlopen(req, timeout=timeout, context=self._ssl) as resp:
                    body = resp.read().decode("utf-8", errors="replace")
                    status = resp.status
            except urllib.error.HTTPError as e:  # noqa: PERF203
                if e.code in transient and attempt < self.max_retries - 1:
                    wait = self.backoff_base * (2 ** attempt)          # 5s,10s,20s
                    ra = e.headers.get("Retry-After") if e.headers else None
                    if ra and str(ra).isdigit():
                        wait = max(wait, int(ra))                      # obey the server
                    time.sleep(min(wait, 90))
                    continue
                if e.code == 403:
                    self._blocked_hosts.add(host)     # only a real ban is permanent
                return FetchResult(ok=False, status=e.code,
                                   blocked=e.code in (403, 429), reason=f"http_{e.code}")
            except Exception as exc:  # noqa: BLE001
                # timeouts/connection resets are transient too -> retry a couple times
                if attempt < self.max_retries - 1:
                    time.sleep(self.backoff_base * (2 ** attempt))
                    continue
                return FetchResult(ok=False, reason=f"error:{exc}")

            if any(m in body.lower()[:4000] for m in CAPTCHA_MARKERS):
                self._blocked_hosts.add(host)
                return FetchResult(ok=False, status=status, blocked=True, reason="captcha")

            if cache_key:
                RAW_DIR.mkdir(parents=True, exist_ok=True)
                (RAW_DIR / cache_key).write_text(body, encoding="utf-8")
            return FetchResult(ok=True, status=status, text=body)

        return FetchResult(ok=False, blocked=True, reason="retries_exhausted")


# Back-compat helper for any old callers.
def fetch(url: str, cache_key: str | None = None, timeout: int = 20) -> str | None:
    res = Fetcher().get(url, cache_key=cache_key, timeout=timeout)
    return res.text if res.ok else None
