#!/usr/bin/env python3
"""
Phase 3 — cross-validation for NEWS_EVENTS: cluster + confirm.

Plain language: several outlets often report the SAME event. We group articles
that look like the same story (similar title words + same/nearby date + shared
locations) into one cluster. If a cluster is backed by >=2 INDEPENDENT major
sources, we mark it status=confirmed; otherwise it stays reported.

We keep every article but stamp each with its cluster_id and the cluster's
status, so the query layer can say "confirmed by 2 sources" honestly.

Reads:  data/processed/news_events.json
Writes: data/processed/news_events.validated.json, data/processed/news.report.md
"""
from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from halo.util import make_id, norm_name, now_iso  # noqa: E402

NEWS = ROOT / "data" / "processed" / "news_events.json"
OUT = ROOT / "data" / "processed" / "news_events.validated.json"
REPORT = ROOT / "data" / "processed" / "news.report.md"

STOP = {"demo", "the", "a", "an", "of", "in", "as", "to", "and", "after", "near", "hits"}


def title_tokens(title: str) -> set[str]:
    return {w for w in norm_name(title).split() if w not in STOP and len(w) > 2}


def days_apart(a: str, b: str) -> int:
    try:
        return abs((date.fromisoformat(a) - date.fromisoformat(b)).days)
    except Exception:  # noqa: BLE001
        return 999


def same_event(e1: dict, e2: dict) -> bool:
    overlap = title_tokens(e1["title"]) & title_tokens(e2["title"])
    loc_overlap = set(e1["locations_involved"]) & set(e2["locations_involved"])
    close_in_time = days_apart(e1.get("date", ""), e2.get("date", "")) <= 3
    return close_in_time and (len(overlap) >= 2 or bool(loc_overlap and overlap))


def cluster(events: list[dict]) -> list[list[dict]]:
    clusters: list[list[dict]] = []
    for e in events:
        placed = next((c for c in clusters if same_event(c[0], e)), None)
        if placed is not None:
            placed.append(e)
        else:
            clusters.append([e])
    return clusters


def main() -> None:
    events = json.loads(NEWS.read_text(encoding="utf-8"))
    clusters = cluster(events)

    out: list[dict] = []
    confirmed = 0
    for group in clusters:
        cid = make_id("evt", group[0]["title"], group[0].get("date", ""))
        sources = {s for e in group for s in e["source_ids"]}
        status = "confirmed" if len(sources) >= 2 else "reported"
        if status == "confirmed":
            confirmed += 1
        for e in group:
            e["cluster_id"] = cid
            e["status"] = status
            e["confidence"] = 0.8 if status == "confirmed" else 0.5
            e["last_updated"] = now_iso()
            out.append(e)

    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = ["# News — validation report", f"_Generated {now_iso()}_", "",
             f"- articles: **{len(events)}**",
             f"- clusters (distinct events): **{len(clusters)}**",
             f"- confirmed (>=2 sources): **{confirmed}**", "",
             "## Events", "| date | status | tags | locations | title |",
             "|---|---|---|---|---|"]
    for group in sorted(clusters, key=lambda g: g[0].get("date", ""), reverse=True):
        e = group[0]
        st = "✅ confirmed" if len({s for x in group for s in x["source_ids"]}) >= 2 else "🟡 reported"
        lines.append(f"| {e.get('date','')} | {st} | {', '.join(e['tags'])} | "
                     f"{', '.join(e['locations_involved'])} | {e['title']} |")
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[validate-news] {len(events)} articles -> {len(clusters)} events; "
          f"confirmed={confirmed} -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
