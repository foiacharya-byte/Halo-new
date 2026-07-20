#!/usr/bin/env python3
"""
Phase 3 — cross-validation & quality scoring for AREAS.

Acceptance rule (from the spec):
  Accept an area name only if it appears in >=2 independent sources
  OR at least once in an OFFICIAL (trust_level=high) source.

We also:
  * dedupe by normalised name (folding aliases together),
  * lift confidence for accepted records and clear needs_review only when an
    official source backs it AND at least one PIN code is present,
  * write a small human-readable report so the founder can see what passed/failed.

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
    """id -> trust_level from the source catalogue."""
    cat = json.loads(CATALOGUE.read_text(encoding="utf-8"))
    trust: dict[str, str] = {}
    for group in cat["categories"].values():
        for src in group:
            trust[src["id"]] = src["trust_level"]
    return trust


def dedupe(records: list[dict]) -> list[dict]:
    by_key: dict[str, dict] = {}
    for r in records:
        key = norm_name(r["name"])
        if key in by_key:
            cur = by_key[key]
            cur["source_ids"] = sorted(set(cur["source_ids"]) | set(r["source_ids"]))
            cur["source_links"] = sorted(set(cur["source_links"]) | set(r["source_links"]))
            cur["pin_codes"] = sorted(set(cur["pin_codes"]) | set(r["pin_codes"]))
            cur["aliases"] = sorted(set(cur["aliases"]) | set(r["aliases"]) | {r["name"]} - {cur["name"]})
        else:
            by_key[key] = dict(r)
    return list(by_key.values())


def validate(records: list[dict], trust: dict[str, str]) -> tuple[list[dict], list[str]]:
    accepted, log = [], []
    for r in records:
        sids = r.get("source_ids", [])
        has_official = any(trust.get(s) == "high" for s in sids)
        independent = len(set(sids))
        ok = has_official or independent >= 2
        if not ok:
            log.append(f"- ❌ **{r['name']}** — only {independent} non-official source(s); held for review.")
            continue
        # scoring
        r["confidence"] = round(min(1.0, 0.6 + 0.15 * independent + (0.15 if has_official else 0)), 2)
        r["needs_review"] = not (has_official and bool(r.get("pin_codes")))
        r["last_updated"] = now_iso()
        accepted.append(r)
        flag = "✅" if not r["needs_review"] else "🟡"
        log.append(f"- {flag} **{r['name']}** — {independent} src, official={has_official}, conf={r['confidence']}")
    return accepted, log


def main() -> None:
    records = json.loads(AREAS.read_text(encoding="utf-8"))
    trust = load_trust_map()
    deduped = dedupe(records)
    accepted, log = validate(deduped, trust)

    OUT.write_text(json.dumps(accepted, indent=2, ensure_ascii=False), encoding="utf-8")

    report = [
        "# Areas — validation report",
        f"_Generated {now_iso()}_",
        "",
        f"- input records: **{len(records)}**",
        f"- after dedupe: **{len(deduped)}**",
        f"- accepted: **{len(accepted)}**  ·  held for review: **{len(deduped) - len(accepted)}**",
        "",
        "Legend: ✅ verified-ready · 🟡 accepted but needs human review · ❌ held",
        "",
        *log,
    ]
    REPORT.write_text("\n".join(report) + "\n", encoding="utf-8")
    print(f"[validate-areas] accepted {len(accepted)}/{len(deduped)} -> {OUT.relative_to(ROOT)}")
    print(f"[validate-areas] report -> {REPORT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
