"""
halo/translate.py — Gujarati (and other) -> English translation.

Honesty rule: we NEVER fabricate a translation. If no real engine is available we
return the original text with translated=False, so the record is clearly marked
needs_translation rather than silently mangled.

Engines tried (config.translate.engine = "auto"), lightest first:
  1. LibreTranslate — open-source MT via HTTP. Set translate.libretranslate_url
     (self-host: `docker run -p 5000:5000 libretranslate/libretranslate`).
  2. deep-translator — TINY dependency, no torch:  pip install deep-translator
     (RECOMMENDED easy option — uses Google Translate's public endpoint).
  3. Argos Translate — fully OFFLINE neural MT, but HEAVY (pulls PyTorch). Only
     if you want offline: pip install argostranslate (model auto-downloads once).
  4. none — keep original, flag needs_translation.

translate() returns (text, engine, ok):
  ok=True  -> text is English, engine names how
  ok=False -> text is the untouched original (engine="none")
"""
from __future__ import annotations

import json
import urllib.parse
import urllib.request

from . import config

_argos_ready: bool | None = None


def _try_libretranslate(text: str, src: str) -> str | None:
    url = config.get("translate", "libretranslate_url", default="")
    if not url:
        return None
    payload = {"q": text, "source": src, "target": "en", "format": "text"}
    key = config.get("translate", "libretranslate_api_key", default="")
    if key:
        payload["api_key"] = key
    try:
        req = urllib.request.Request(
            url, data=urllib.parse.urlencode(payload).encode(),
            headers={"User-Agent": config.user_agent(),
                     "Content-Type": "application/x-www-form-urlencoded"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8")).get("translatedText") or None
    except Exception:  # noqa: BLE001
        return None


def _try_deep_translator(text: str, src: str) -> str | None:
    """deep-translator (tiny, no torch): pip install deep-translator."""
    try:
        from deep_translator import GoogleTranslator
        return GoogleTranslator(source=src, target="en").translate(text[:4900])
    except Exception:  # noqa: BLE001
        return None


def _ensure_argos(src: str) -> bool:
    """Install the src->en Argos model on first use. Returns True if usable."""
    global _argos_ready
    if _argos_ready is not None:
        return _argos_ready
    try:
        import argostranslate.package
        import argostranslate.translate  # noqa: F401
        installed = {(p.from_code, p.to_code)
                     for p in argostranslate.package.get_installed_packages()}
        if (src, "en") not in installed:
            argostranslate.package.update_package_index()
            avail = argostranslate.package.get_available_packages()
            pkg = next((p for p in avail if p.from_code == src and p.to_code == "en"), None)
            if pkg is None:
                _argos_ready = False
                return False
            argostranslate.package.install_from_path(pkg.download())
        _argos_ready = True
    except Exception:  # noqa: BLE001
        _argos_ready = False
    return _argos_ready


def _try_argos(text: str, src: str) -> str | None:
    if not _ensure_argos(src):
        return None
    try:
        import argostranslate.translate
        return argostranslate.translate.translate(text, src, "en")
    except Exception:  # noqa: BLE001
        return None


def translate(text: str, src_lang: str) -> tuple[str, str, bool]:
    """Return (text, engine, ok). ok=False keeps the original untouched."""
    if not text or src_lang == "en":
        return text, "none", src_lang == "en"
    engine = config.get("translate", "engine", default="auto")

    if engine in ("auto", "libretranslate"):
        out = _try_libretranslate(text, src_lang)
        if out:
            return out, "libretranslate", True
    if engine in ("auto", "deep", "deep_translator"):
        out = _try_deep_translator(text, src_lang)
        if out:
            return out, "deep_translator", True
    if engine in ("auto", "argos"):
        out = _try_argos(text, src_lang)
        if out:
            return out, "argos", True
    return text, "none", False   # honest: no engine -> untouched original
