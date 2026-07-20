"""
halo/util.py — small, dependency-free helpers shared across the pipeline.

Normalisers here are deliberately conservative: when in doubt we keep the raw
value and flag it, rather than "cleaning" it into something wrong. Trust > tidy.
"""
from __future__ import annotations

import hashlib
import re
import unicodedata
from datetime import datetime, timezone


# ---------------------------------------------------------------------------
# Time
# ---------------------------------------------------------------------------
def now_iso() -> str:
    """UTC timestamp, ISO-8601, second precision. Used for last_updated/last_seen."""
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


# ---------------------------------------------------------------------------
# Text
# ---------------------------------------------------------------------------
def slugify(text: str) -> str:
    """'Alkapuri Society' -> 'alkapuri-society'. Stable, ascii-only, for ids/keys."""
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text or "unknown"


def norm_name(name: str) -> str:
    """Loose name key for dedupe: lowercase, collapse whitespace, drop punctuation."""
    name = unicodedata.normalize("NFKD", name or "")
    name = re.sub(r"[^\w\s]", " ", name, flags=re.UNICODE)
    return re.sub(r"\s+", " ", name).strip().lower()


def make_id(entity: str, *parts: str) -> str:
    """Deterministic id: entity + slug of the joined parts (so re-runs are stable)."""
    key = "|".join(p for p in parts if p)
    digest = hashlib.sha1(key.encode("utf-8")).hexdigest()[:8]
    return f"{entity}:{slugify(parts[0]) if parts else 'x'}:{digest}"


# ---------------------------------------------------------------------------
# Phone (India / Gujarat)  — normalise, NEVER auto-publish (DPDP)
# ---------------------------------------------------------------------------
def normalize_phone(raw: str) -> str | None:
    """
    Return E.164-ish '+91XXXXXXXXXX' for a valid Indian mobile/landline, else None.
    Landlines may carry an STD code; we keep the last 10 digits after +91.
    We do NOT invent country codes for anything that isn't clearly Indian.
    """
    if not raw:
        return None
    digits = re.sub(r"\D", "", raw)
    # strip a leading country code if present
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10 and digits[0] in "6789":  # Indian mobile
        return f"+91{digits}"
    if 6 <= len(digits) <= 11:  # landline w/ STD code — keep, flagged by caller
        return f"+91{digits[-10:]}" if len(digits) >= 10 else None
    return None


def phone_key(raw: str) -> str | None:
    """Bare 10-digit key for deduping across platforms (no '+91')."""
    p = normalize_phone(raw)
    return p[3:] if p else None
