#!/usr/bin/env python3
"""
Phase 4 — build search indexes over whatever validated datasets exist.

Produces data/processed/index.json with:
  * text:  token -> [ "entity:id", ... ]   (inverted index over names/aliases/summaries)
  * zone:  zone  -> [area ids]
  * pin:   pin   -> [area ids]
  * tag:   tag   -> [news/trip ids]
  * mood:  mood  -> [trip ids]
  * docs:  "entity:id" -> minimal display record (so the query layer needs one file)

Design: dataset-agnostic. As services/news/trips validated files appear, they are
indexed automatically with no code change.
"""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
PROC = ROOT / "data" / "processed"

DATASETS = {
    "area": "areas.validated.json",
    "service": "services.validated.json",
    "news_event": "news_events.validated.json",
    "trip_spot": "trip_spots.validated.json",
}

STOP = {"the", "a", "an", "of", "in", "and", "road", "society", "near"}


def tokenize(*texts: str) -> set[str]:
    toks: set[str] = set()
    for t in texts:
        for w in re.split(r"[^a-z0-9]+", (t or "").lower()):
            if len(w) > 1 and w not in STOP:
                toks.add(w)
    return toks


def main() -> None:
    text_idx: dict[str, set] = defaultdict(set)
    zone_idx: dict[str, list] = defaultdict(list)
    pin_idx: dict[str, list] = defaultdict(list)
    tag_idx: dict[str, list] = defaultdict(list)
    mood_idx: dict[str, list] = defaultdict(list)
    docs: dict[str, dict] = {}

    for entity, fname in DATASETS.items():
        path = PROC / fname
        if not path.exists():
            continue
        for r in json.loads(path.read_text(encoding="utf-8")):
            if r.get("takedown"):
                continue
            key = f"{entity}:{r['id']}"
            docs[key] = r
            name = r.get("name") or r.get("title", "")
            summary = r.get("description_summary") or r.get("short_summary", "")
            for tok in tokenize(name, summary, " ".join(r.get("aliases", []))):
                text_idx[tok].add(key)
            if entity == "area":
                if r.get("zone_group"):
                    zone_idx[r["zone_group"].lower()].append(key)
                for pin in r.get("pin_codes", []):
                    pin_idx[pin].append(key)
            for tag in r.get("tags", []):
                tag_idx[tag.lower()].append(key)
            for mood in r.get("best_for_mood", []):
                mood_idx[mood.lower()].append(key)

    out = {
        "text": {k: sorted(v) for k, v in text_idx.items()},
        "zone": dict(zone_idx),
        "pin": dict(pin_idx),
        "tag": dict(tag_idx),
        "mood": dict(mood_idx),
        "docs": docs,
    }
    (PROC / "index.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print(f"[index] {len(docs)} docs · {len(text_idx)} tokens · "
          f"{len(zone_idx)} zones · {len(pin_idx)} pins -> data/processed/index.json")


if __name__ == "__main__":
    main()
