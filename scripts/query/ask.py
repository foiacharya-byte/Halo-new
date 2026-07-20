#!/usr/bin/env python3
"""
Phase 5 — ask Halo a question.

This is the small "city LLM" glue: it interprets intent, queries the index,
and prints a clean, SOURCED summary. It is intentionally rule-based (no external
model needed) so it runs free and offline; a real LLM can later replace the
`summarise_*` functions while keeping the same retrieve-then-summarise shape.

Usage:
  python3 scripts/query/ask.py "tell me about Alkapuri"
  python3 scripts/query/ask.py "areas in the West zone"
  python3 scripts/query/ask.py "which area has pincode 390018"
  python3 scripts/query/ask.py "peaceful trip near Karelibaug"   # once trips exist
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / "data" / "processed" / "index.json"

ZONES = {"north", "south", "east", "west", "central"}


def load_index() -> dict:
    if not INDEX.exists():
        sys.exit("No index found. Run: python3 scripts/index/build_index.py")
    return json.loads(INDEX.read_text(encoding="utf-8"))


def tokenize(q: str) -> list[str]:
    return [w for w in re.split(r"[^a-z0-9]+", q.lower()) if len(w) > 1]


def cite(doc: dict) -> str:
    links = doc.get("source_links", [])
    fresh = doc.get("last_updated", "")[:10]
    src = links[0] if links else "(no source)"
    return f"source: {src} · updated {fresh}"


def summarise_area(doc: dict) -> str:
    bits = [f"**{doc['name']}** — a {doc.get('type','locality')} of Vadodara"]
    if doc.get("parent_zone"):
        bits.append(f"in the {doc['parent_zone']} zone")
    line = " ".join(bits) + "."
    if doc.get("pin_codes"):
        line += f" PIN: {', '.join(doc['pin_codes'])}."
    if doc.get("needs_review"):
        line += " _(zone/PIN not yet officially verified — treat as indicative.)_"
    return f"{line}\n  {cite(doc)}"


def answer(q: str, idx: dict) -> str:
    toks = tokenize(q)
    docs = idx["docs"]

    # Intent: zone listing ("areas in the west zone")
    for z in ZONES:
        if z in toks and ("zone" in toks or "areas" in toks or "area" in toks):
            keys = idx["zone"].get(z, [])
            if not keys:
                return f"No areas indexed for the {z.title()} zone yet."
            names = sorted(docs[k]["name"] for k in keys)
            return (f"Areas in the **{z.title()} zone** ({len(names)}):\n  "
                    + ", ".join(names)
                    + "\n  _(Grouping is indicative — verify against VMC.)_")

    # Intent: pincode lookup
    pin_match = re.search(r"\b(3\d{5})\b", q)
    if pin_match:
        keys = idx["pin"].get(pin_match.group(1), [])
        if not keys:
            return f"No area indexed for PIN {pin_match.group(1)}."
        names = ", ".join(sorted(docs[k]["name"] for k in keys))
        return f"PIN **{pin_match.group(1)}** covers: {names}."

    # Intent: free-text — score docs by token overlap in the text index
    scores: dict[str, int] = {}
    for t in toks:
        for key in idx["text"].get(t, []):
            scores[key] = scores.get(key, 0) + 1
    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:3]
    if not ranked:
        return ("I don't have anything on that yet. Current coverage: areas. "
                "Services, news and trips are on the roadmap.")

    out = []
    for key, _ in ranked:
        doc = docs[key]
        entity = key.split(":", 1)[0]
        if entity == "area":
            out.append(summarise_area(doc))
        else:  # generic fallback for future entities
            title = doc.get("name") or doc.get("title", "")
            summ = doc.get("description_summary") or doc.get("short_summary", "")
            out.append(f"**{title}** — {summ}\n  {cite(doc)}")
    return "\n\n".join(out)


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit('Ask something, e.g.  python3 scripts/query/ask.py "tell me about Alkapuri"')
    q = " ".join(sys.argv[1:])
    print(f"\n🔎 {q}\n")
    print(answer(q, load_index()))
    print()


if __name__ == "__main__":
    main()
