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

# category synonyms -> canonical category used in the index
CATEGORY_SYNONYMS = {
    "food": "food", "restaurant": "food", "restaurants": "food", "cafe": "food",
    "eat": "food", "dining": "food", "tiffin": "food",
    "electrician": "electrician", "ac": "electrician", "appliance": "electrician",
    "repair": "electrician", "electrical": "electrician",
    "health": "health", "clinic": "health", "doctor": "health", "dental": "health",
    "dentist": "health", "hospital": "health", "pharmacy": "health",
    "grocery": "grocery", "salon": "salon", "auto": "auto",
    "electronics": "electronics", "hardware": "hardware",
}


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


STATUS_NOTE = {
    "confirmed_official": "verified against an official source",
    "multi_source": "named by multiple sources (still cross-checking details)",
    "single_source_needs_review": "from our curated seed — a real place name, "
                                  "but attributes are indicative and not yet source-verified",
}


def summarise_area(doc: dict) -> str:
    typ = doc.get("type", "locality")
    bits = [f"**{doc['name']}** — a {typ} of Vadodara"]
    if doc.get("taluka"):
        bits.append(f"({doc['taluka']} taluka)")
    if doc.get("zone_group"):
        bits.append(f"in the {doc['zone_group']} zone")
    line = " ".join(bits) + "."
    if doc.get("pin_codes"):
        line += f" PIN: {', '.join(doc['pin_codes'])} (indicative)."
    status = doc.get("status", "single_source_needs_review")
    note = STATUS_NOTE.get(status, "")
    confidence = doc.get("confidence")
    line += f"\n  Status: **{status}** (confidence {confidence}) — {note}."
    if doc.get("zone_group") or doc.get("pin_codes"):
        line += "\n  _Zone/PIN shown are indicative until verified against VMC / India Post._"
    return f"{line}\n  {cite(doc)}"


def summarise_service(doc: dict) -> str:
    demo = " _(demo data — not a real listing)_" if doc.get("is_demo") else ""
    head = f"**{doc['name']}** — {doc.get('category','service')} in {doc.get('locality','')}{demo}"
    parts = []
    if doc.get("halo_rating") is not None:
        star = " · ⭐ Halo 5★" if doc.get("halo_five_star") else ""
        parts.append(f"Halo rating **{doc['halo_rating']}/5**{star} "
                     f"(from {doc.get('rating_count')} reviews, ext {doc.get('rating_score')})")
    else:
        parts.append("no rating signals yet — not scored")
    if doc.get("permanently_closed"):
        parts.append("⚠️ reported permanently closed on a source")
    # NEVER print the phone: consent gate
    parts.append("contact withheld until the owner claims & consents (DPDP)")
    body = "\n  ".join(parts)
    return f"{head}\n  {body}\n  {cite(doc)}"


def answer_service(q: str, toks: list[str], idx: dict) -> str | None:
    if "category" not in idx or not idx["category"]:
        return None
    cat = next((CATEGORY_SYNONYMS[t] for t in toks if t in CATEGORY_SYNONYMS), None)
    loc = next((l for l in idx.get("locality", {}) if l in " ".join(toks)), None)
    if not cat and not loc:
        return None

    docs = idx["docs"]
    if cat and loc:
        keys = [k for k in idx["category"].get(cat, []) if k in set(idx["locality"].get(loc, []))]
        scope = f"{cat} in {loc.title()}"
    elif cat:
        keys = idx["category"].get(cat, [])
        scope = cat
    else:
        keys = idx["locality"].get(loc, [])
        scope = f"services in {loc.title()}"

    if not keys:
        return f"No {scope} in the dataset yet."
    want_5star = "5" in "".join(toks) or "five" in toks or "best" in toks or "top" in toks
    cand = [docs[k] for k in keys]
    if want_5star:
        five = [d for d in cand if d.get("halo_five_star")]
        cand = five or cand
    cand.sort(key=lambda d: (d.get("halo_five_star", False), d.get("halo_rating") or -1), reverse=True)
    top = cand[:3]
    header = f"Top {scope} by Halo rating:"
    return header + "\n\n" + "\n\n".join(summarise_service(d) for d in top)


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

    # Intent: SERVICE search — a category and/or a locality is mentioned.
    svc = answer_service(q, toks, idx)
    if svc is not None:
        return svc

    # Intent: free-text — score docs by token overlap in the text index,
    # then boost an exact name match so "Karelibaug" beats "Karelibaug Water Tank Rd".
    qnorm = " ".join(toks)
    scores: dict[str, float] = {}
    for t in toks:
        for key in idx["text"].get(t, []):
            scores[key] = scores.get(key, 0) + 1
    for key in list(scores):
        name = (docs[key].get("name") or docs[key].get("title", "")).lower()
        name_toks = [w for w in re.split(r"[^a-z0-9]+", name) if len(w) > 1]
        if name and name in qnorm:
            scores[key] += 5                      # whole name appears in the query
        if name_toks and all(w in toks for w in name_toks):
            scores[key] += 3 / len(name_toks)     # fewer extra words = tighter match
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
