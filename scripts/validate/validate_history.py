#!/usr/bin/env python3
"""
Phase 3 — validate HISTORY docs: dedupe near-identical paragraphs, keep sources.

Reads:  data/processed/history.json
Writes: data/processed/history.validated.json, data/processed/history.report.md
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from halo.util import norm_name, now_iso  # noqa: E402

HIST = ROOT / "data" / "processed" / "history.json"
OUT = ROOT / "data" / "processed" / "history.validated.json"
REPORT = ROOT / "data" / "processed" / "history.report.md"


def main() -> None:
    docs = json.loads(HIST.read_text(encoding="utf-8")) if HIST.exists() else []
    seen: dict[str, dict] = {}
    for d in docs:
        key = norm_name(d.get("summary", ""))[:120]   # dedupe by leading text
        if key and key not in seen:
            d["last_updated"] = now_iso()
            seen[key] = d
    out = list(seen.values())
    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")

    by_period: dict[str, int] = {}
    for d in out:
        by_period[d.get("period") or "unknown"] = by_period.get(d.get("period") or "unknown", 0) + 1
    lines = ["# History — validation report", f"_Generated {now_iso()}_", "",
             f"- paragraphs/docs: **{len(docs)}** -> **{len(out)}** after dedupe",
             f"- awaiting translation: **{sum(1 for d in out if d.get('needs_translation'))}**",
             "", "## By period", *[f"- {k}: {v}" for k, v in sorted(by_period.items())]]
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[validate-history] {len(docs)} -> {len(out)} -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
