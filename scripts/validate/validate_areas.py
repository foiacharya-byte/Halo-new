#!/usr/bin/env python3
"""
Phase 3 — cross-validation & quality scoring for AREAS.

In plain language, this step does four things:
  1. MERGE spelling variants. "Bhayli", "Bhayali" and "Bhaili" are the same place;
     we fold them into one record using the aliases, and note the merge.
  2. DECIDE A STATUS for each place, from how strong its sources are:
       - confirmed_official          -> backed by an official (high-trust) source
       - multi_source                -> named by >=2 independent sources
       - single_source_needs_review  -> only our curated seed so far (default)
  3. SCORE confidence (0..1) roughly in line with that status.
  4. WRITE a human-readable report + a merge log the founder can skim.

We KEEP single-source places in the dataset (so coverage is real) but mark them
needs_review=True, so nothing unverified can masquerade as confirmed.

Reads:  data/processed/areas.json, sources_catalogue/sources.json
Writes: data/processed/areas.validated.json, data/processed/areas.report.md
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from halo.util import norm_name, now_iso  # noqa: E402

AREAS = ROOT / "data" / "processed" / "areas.json"
CATALOGUE = ROOT / "sources_catalogue" / "sources.json"
OUT = ROOT / "data" / "processed" / "areas.validated.json"
REPORT = ROOT / "data" / "processed" / "areas.report.md"


def load_trust_map() -> dict[str, str]:
    """id -> trust_level from the source catalogue (high/medium/low/seed)."""
    cat = json.loads(CATALOGUE.read_text(encoding="utf-8"))
    trust: dict[str, str] = {}
    for group in cat["categories"].values():
        for src in group:
            trust[src["id"]] = src["trust_level"]
    return trust


def dedupe(records: list[dict]) -> tuple[list[dict], list[str]]:
    """
    Merge records whose name OR any alias normalises to the same key.
    First occurrence wins as the canonical record; others fold in.
    Returns (merged_records, merge_log_lines).
    """
    key_to_canonical: dict[str, dict] = {}
    canonical_order: list[dict] = []
    merges: list[str] = []

    for r in records:
        keys = {norm_name(r["name"])} | {norm_name(a) for a in r.get("aliases", [])}
        hit = next((key_to_canonical[k] for k in keys if k in key_to_canonical), None)
        if hit is None:
            canonical_order.append(r)
            for k in keys:
                key_to_canonical[k] = r
        else:
            if norm_name(r["name"]) != norm_name(hit["name"]):
                merges.append(f"- 🔁 merged **{r['name']}** into **{hit['name']}**")
            hit["source_ids"] = sorted(set(hit["source_ids"]) | set(r["source_ids"]))
            hit["source_links"] = sorted(set(hit["source_links"]) | set(r["source_links"]))
            hit["pin_codes"] = sorted(set(hit.get("pin_codes", [])) | set(r.get("pin_codes", [])))
            # collect variant spellings as aliases (minus the canonical name)
            extra = set(hit.get("aliases", [])) | set(r.get("aliases", [])) | {r["name"]}
            hit["aliases"] = sorted(extra - {hit["name"]})
            hit["taluka"] = hit.get("taluka") or r.get("taluka")
            hit["zone_group"] = hit.get("zone_group") or r.get("zone_group")
            # register the new keys so a 3rd spelling also finds this canonical
            for k in keys:
                key_to_canonical.setdefault(k, hit)
    return canonical_order, merges


def decide_status(source_ids: list[str], trust: dict[str, str]) -> str:
    levels = [trust.get(s, "seed") for s in set(source_ids)]
    if "high" in levels:
        return "confirmed_official"
    independent_real = [s for s in set(source_ids) if trust.get(s) in ("high", "medium", "low")]
    if len(independent_real) >= 2:
        return "multi_source"
    return "single_source_needs_review"


def score(records: list[dict], trust: dict[str, str]) -> list[str]:
    log = []
    conf_by_status = {
        "confirmed_official": 0.9,
        "multi_source": 0.7,
        "single_source_needs_review": 0.4,
    }
    for r in records:
        status = decide_status(r.get("source_ids", []), trust)
        r["status"] = status
        r["confidence"] = conf_by_status[status]
        r["needs_review"] = status != "confirmed_official"
        r["last_updated"] = now_iso()
        icon = {"confirmed_official": "✅", "multi_source": "🟢",
                "single_source_needs_review": "🟡"}[status]
        log.append(f"- {icon} **{r['name']}** ({r['type']}) — {status}, conf={r['confidence']}")
    return log


def main() -> None:
    records = json.loads(AREAS.read_text(encoding="utf-8"))
    trust = load_trust_map()
    merged, merge_log = dedupe(records)
    score_log = score(merged, trust)

    OUT.write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")

    counts: dict[str, int] = {}
    for r in merged:
        counts[r["status"]] = counts.get(r["status"], 0) + 1

    report = [
        "# Areas — validation report",
        f"_Generated {now_iso()}_",
        "",
        f"- input records: **{len(records)}**",
        f"- after variant-merge: **{len(merged)}**  ({len(records) - len(merged)} merged)",
        "",
        "## Status breakdown",
        *[f"- **{k}**: {v}" for k, v in sorted(counts.items())],
        "",
        "## Merges (spelling variants folded together)",
        *(merge_log or ["- (none)"]),
        "",
        "## All records",
        "Legend: ✅ confirmed_official · 🟢 multi_source · 🟡 single_source_needs_review",
        "",
        *score_log,
    ]
    REPORT.write_text("\n".join(report) + "\n", encoding="utf-8")
    print(f"[validate-areas] {len(records)} -> {len(merged)} after merge "
          f"({len(records) - len(merged)} merged) -> {OUT.relative_to(ROOT)}")
    print(f"[validate-areas] status: {counts}")


if __name__ == "__main__":
    main()
