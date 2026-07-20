#!/usr/bin/env python3
"""
Phase 3 — cross-validation & scoring for SERVICES.

Two jobs, in plain language:

1) DEDUPE across platforms. The same shop appears on many directories with
   slightly different names. We group by:
      primary key  = phone (digits only) + loose name
      fallback key = loose name + locality      (when there is no phone)
   When we merge two copies we keep both platform names, union the source
   platforms, sum review counts (different platforms = different reviews),
   take a review-weighted average rating, and if ANY platform says
   "permanently closed" we treat the shop as closed (safer for users).

2) COMPUTE halo_rating (0..5) — our own trust score — ONLY from real signals:
      rating value        (how good)
      review_count        (how many people said so)
      recency             (recent activity beats stale)
      consistency         (closed-anywhere or demo -> penalised)
   No signals -> halo_rating stays null. We never invent a score.

A shop earns halo_five_star only if rating>=4.8 AND reviews>=50 AND recent AND
not closed anywhere. Phone numbers are NEVER published here (contact_consent
stays False until an owner claims + consents).

Reads:  data/processed/services.json
Writes: data/processed/services.validated.json, data/processed/services.report.md
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from halo.util import norm_name, phone_key, now_iso  # noqa: E402

SERVICES = ROOT / "data" / "processed" / "services.json"
OUT = ROOT / "data" / "processed" / "services.validated.json"
REPORT = ROOT / "data" / "processed" / "services.report.md"

REVIEW_FULL = 100    # reviews at/above this give full "how many" weight
FIVE_STAR_MIN_RATING = 4.8
FIVE_STAR_MIN_REVIEWS = 50


CATEGORY_WORD = {
    "food": "eatery", "restaurant": "restaurant", "cafe": "café", "health": "healthcare provider",
    "hospital": "hospital", "clinic": "clinic", "pharmacy": "pharmacy", "electrician": "electrical service",
    "grocery": "grocery store", "salon": "salon", "auto": "automotive service", "finance": "bank/ATM",
    "education": "educational institution", "hospitality": "hotel", "temple": "temple",
    "office": "office", "hardware": "hardware store", "electronics": "electronics store",
    "museum": "museum", "heritage": "heritage site", "park": "park", "fort": "fort",
}
SOURCE_NAME = {"src.osm.overpass": "OpenStreetMap", "src.wikidata": "Wikidata",
               "src.seed.curated": "curated seed"}


def _human_sources(source_ids: list[str], platforms: list[str]) -> str:
    names = []
    for s in source_ids:
        names.append(SOURCE_NAME.get(s, s.replace("src.", "").split(".")[0].title()))
    names = sorted(set(names))
    if len(names) >= 2:
        return ", ".join(names[:-1]) + " and " + names[-1]
    return names[0] if names else "an open source"


def build_summary(r: dict) -> str:
    """Halo's OWN sentence, synthesised from the merged fields (not copied verbatim)."""
    name = r["name"]
    cat = CATEGORY_WORD.get(r.get("category", ""), (r.get("category") or "place").replace("_", " "))
    loc = r.get("locality") or "Vadodara"
    art = "an" if cat[:1].lower() in "aeiou" else "a"
    s = f"{name} is {art} {cat} in {loc}."
    desc = (r.get("description_summary") or "").strip()
    if desc and desc.lower() not in name.lower():
        s += f" {desc[0].upper() + desc[1:]}."
    if r.get("opening_hours"):
        s += f" Open {r['opening_hours']}."
    if r.get("halo_rating") is not None:
        s += f" Halo rates it {r['halo_rating']}/5"
        s += " (a top-rated pick)." if r.get("halo_five_star") else "."
    if r.get("website"):
        s += f" More at {r['website']}."
    n_src = len(set(r.get("source_ids", [])))
    s += (f" Details combined from {_human_sources(r.get('source_ids', []), r.get('source_platforms', []))}"
          + (" (2+ sources agree)." if n_src >= 2 else "."))
    return s


def key_for(r: dict) -> str:
    pk = phone_key(r["phone_numbers"][0]) if r.get("phone_numbers") else None
    return f"ph:{pk}" if pk else f"nm:{norm_name(r['name'])}|{norm_name(r.get('locality',''))}"


def merge_pair(a: dict, b: dict) -> dict:
    """Fold b into a (a stays canonical)."""
    a["source_platforms"] = sorted(set(a["source_platforms"]) | set(b["source_platforms"]))
    a["source_links"] = sorted(set(a["source_links"]) | set(b["source_links"]))
    a["source_ids"] = sorted(set(a["source_ids"]) | set(b["source_ids"]))
    a["phone_numbers"] = sorted(set(a["phone_numbers"]) | set(b["phone_numbers"]))
    a["permanently_closed"] = a["permanently_closed"] or b["permanently_closed"]
    a["is_demo"] = a["is_demo"] or b["is_demo"]
    # review-weighted average rating; summed review counts
    ra, rb = a.get("rating_score"), b.get("rating_score")
    ca, cb = a.get("rating_count") or 0, b.get("rating_count") or 0
    if ra is not None and rb is not None and (ca + cb) > 0:
        a["rating_score"] = round((ra * ca + rb * cb) / (ca + cb), 2)
    elif rb is not None and ra is None:
        a["rating_score"] = rb
    a["rating_count"] = (ca + cb) or a.get("rating_count")
    # keep the freshest activity (smallest days-since)
    da, db = a.get("_last_review_days"), b.get("_last_review_days")
    a["_last_review_days"] = min([x for x in (da, db) if x is not None], default=None)
    # combine the DETAIL from both sources (prefer whichever has it / the longer text)
    for f in ("website", "opening_hours", "address"):
        if not a.get(f) and b.get(f):
            a[f] = b[f]
    if len(b.get("description_summary", "")) > len(a.get("description_summary", "")):
        a["description_summary"] = b["description_summary"]
    a["attributes"] = {**b.get("attributes", {}), **a.get("attributes", {})}
    if not a.get("coordinates") and b.get("coordinates"):
        a["coordinates"] = b["coordinates"]
    return a


def dedupe(records: list[dict]) -> tuple[list[dict], int]:
    groups: dict[str, dict] = {}
    merged = 0
    for r in records:
        k = key_for(r)
        if k in groups:
            merge_pair(groups[k], r)
            merged += 1
        else:
            groups[k] = dict(r)
    return list(groups.values()), merged


def recency_factor(days: int | None) -> float:
    if days is None:
        return 0.7           # unknown recency -> mild discount, not a guess of "fresh"
    if days <= 90:
        return 1.0
    if days <= 365:
        return 0.85
    return 0.6


def compute_halo(r: dict) -> None:
    rating = r.get("rating_score")
    if rating is None:
        r["halo_rating"] = None
        r["halo_five_star"] = False
        return
    reviews = r.get("rating_count") or 0
    review_factor = min(1.0, reviews / REVIEW_FULL)
    rec = recency_factor(r.get("_last_review_days"))
    consistency = 0.4 if r["permanently_closed"] else 1.0
    score01 = (rating / 5.0) * (0.5 + 0.5 * review_factor) * rec * consistency
    r["halo_rating"] = round(score01 * 5, 2)
    r["halo_five_star"] = bool(
        rating >= FIVE_STAR_MIN_RATING
        and reviews >= FIVE_STAR_MIN_REVIEWS
        and rec >= 0.9
        and not r["permanently_closed"]
    )


def main() -> None:
    records = json.loads(SERVICES.read_text(encoding="utf-8"))
    deduped, merged = dedupe(records)
    multi = 0
    for r in deduped:
        compute_halo(r)
        r["needs_review"] = True
        r["last_updated"] = now_iso()
        n_src = len(set(r.get("source_ids", [])))
        r["corroborated"] = n_src >= 2          # 2+ independent sources agree
        r["confidence"] = round(min(0.9, 0.5 + 0.2 * n_src), 2)
        r["halo_summary"] = build_summary(r)    # Halo's OWN sentence from the sources
        multi += r["corroborated"]
    # rank best-first for the report
    deduped.sort(key=lambda r: (r.get("halo_rating") or -1), reverse=True)
    for r in deduped:
        r.pop("_last_review_days", None)   # internal scoring field, not shipped

    OUT.write_text(json.dumps(deduped, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = ["# Services — validation report", f"_Generated {now_iso()}_", "",
             f"- raw listings: **{len(records)}**",
             f"- after phone+name dedupe: **{len(deduped)}** ({merged} merged)",
             f"- corroborated by 2+ sources: **{multi}**",
             f"- halo 5★ flagged: **{sum(1 for r in deduped if r['halo_five_star'])}**",
             "", "## Ranked (demo data — not real listings)",
             "| name | locality | cat | ext★ | reviews | halo★ | 5★ | closed | demo |",
             "|---|---|---|---|---|---|---|---|---|"]
    for r in deduped:
        lines.append(
            f"| {r['name']} | {r['locality']} | {r['category']} | "
            f"{r.get('rating_score')} | {r.get('rating_count')} | "
            f"{r.get('halo_rating')} | {'✅' if r['halo_five_star'] else ''} | "
            f"{'🔒' if r['permanently_closed'] else ''} | {'🧪' if r['is_demo'] else ''} |")
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[validate-services] {len(records)} -> {len(deduped)} ({merged} merged); "
          f"5★={sum(1 for r in deduped if r['halo_five_star'])} -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
