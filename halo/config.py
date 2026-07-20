"""
halo/config.py — load halo_config.json + apply environment overrides.

The one switch that matters:
    runtime.allow_network  (or env HALO_ALLOW_NETWORK=1)
When False (the sandbox default) every real client short-circuits to its
labelled demo fixture WITHOUT touching the network. When True, the clients hit
the real open APIs configured here. This is the single, explicit place a user
flips to "go live" on their own internet-connected machine.

Env overrides (handy for CI / servers, no file edit needed):
    HALO_ALLOW_NETWORK=1
    HALO_USER_AGENT="..."          HALO_CONTACT_EMAIL="me@example.com"
    HALO_NOMINATIM_URL="http://localhost:8080/search"
    HALO_OVERPASS_URL="http://localhost:12345/api/interpreter"
"""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "halo_config.json"


@lru_cache(maxsize=1)
def load() -> dict:
    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))

    # --- environment overrides ---
    env = os.environ
    if env.get("HALO_ALLOW_NETWORK") in ("1", "true", "True"):
        cfg["runtime"]["allow_network"] = True
    if env.get("HALO_USER_AGENT"):
        cfg["runtime"]["user_agent"] = env["HALO_USER_AGENT"]
    if env.get("HALO_CONTACT_EMAIL"):
        cfg["runtime"]["contact_email"] = env["HALO_CONTACT_EMAIL"]
    if env.get("HALO_NOMINATIM_URL"):
        cfg["osm"]["nominatim_url"] = env["HALO_NOMINATIM_URL"]
    if env.get("HALO_OVERPASS_URL"):
        cfg["osm"]["overpass_url"] = env["HALO_OVERPASS_URL"]
    if env.get("HALO_DATAGOV_KEY"):
        cfg.setdefault("govdata", {})["api_key"] = env["HALO_DATAGOV_KEY"]

    # bake the real contact email into the UA string if left as a placeholder
    ua = cfg["runtime"]["user_agent"]
    cfg["runtime"]["user_agent"] = ua.replace("CONTACT_EMAIL", cfg["runtime"]["contact_email"])
    return cfg


def network_allowed() -> bool:
    return bool(load()["runtime"]["allow_network"])


def user_agent() -> str:
    return load()["runtime"]["user_agent"]


def get(*path, default=None):
    """Safe nested lookup: get('osm', 'radius_m', default=1500)."""
    node = load()
    for key in path:
        if isinstance(node, dict) and key in node:
            node = node[key]
        else:
            return default
    return node
