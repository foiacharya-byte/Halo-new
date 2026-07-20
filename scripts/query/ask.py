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
import math
import re
import sys
from collections import Counter
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


NEWS_TAGS = {"flood", "crime", "civic", "politics", "development", "traffic"}
NEWS_TRIGGERS = {"news", "happened", "event", "events", "flooding"}


def summarise_news(doc: dict) -> str:
    demo = " _(demo data — not real reporting)_" if doc.get("is_demo") else ""
    st = doc.get("status", "reported")
    badge = "✅ confirmed by 2+ sources" if st == "confirmed" else "🟡 reported (single source)"
    loc = ", ".join(doc.get("locations_involved", [])) or "Vadodara"
    tags = ", ".join(doc.get("tags", [])) or "general"
    return (f"**{doc.get('title','')}**{demo}\n"
            f"  {doc.get('date','')} · {badge} · tags: {tags} · areas: {loc}\n"
            f"  {doc.get('short_summary','')}\n  {cite(doc)}")


def answer_news(q: str, toks: list[str], idx: dict) -> str | None:
    tagset = set(toks) & NEWS_TAGS
    if not (tagset or set(toks) & NEWS_TRIGGERS):
        return None
    docs = idx["docs"]
    news_keys = [k for k in docs if k.startswith("news_event:")]
    if not news_keys:
        return None
    cand = [docs[k] for k in news_keys]
    if tagset:
        cand = [d for d in cand if tagset & set(d.get("tags", []))] or cand
    loc = next((l for l in idx.get("locality", {}) if l in " ".join(toks)), None)
    if loc:
        cand = [d for d in cand
                if any(loc == x.lower() for x in d.get("locations_involved", []))] or cand
    # confirmed first, then most recent
    cand.sort(key=lambda d: (d.get("status") == "confirmed", d.get("date", "")), reverse=True)
    top = cand[:4]
    return "Vadodara news/events:\n\n" + "\n\n".join(summarise_news(d) for d in top)


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


NEAR_TRIGGERS = {"near", "nearest", "closest", "around", "within", "nearby"}


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in km (straight-line, not road distance)."""
    dlat, dlon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    return 2 * 6371.0 * math.asin(math.sqrt(a))


def _resolve_origin(q: str, toks: list[str], idx: dict):
    """Find the point to search FROM: an explicit lat,lon or a named area with coords."""
    geo, docs = idx.get("geo", {}), idx["docs"]
    m = re.search(r"(-?\d{1,2}\.\d+)\s*,\s*(-?\d{2,3}\.\d+)", q)
    if m:
        return (float(m.group(1)), float(m.group(2))), "your point"
    qn = " ".join(toks)
    best = None
    for key, (lat, lon) in geo.items():
        if not key.startswith("area:"):
            continue
        name = (docs[key].get("name") or "").lower()
        if name and name in qn and (best is None or len(name) > len(best[2])):
            best = ((lat, lon), docs[key]["name"], name)
    return (best[0], best[1]) if best else (None, None)


def answer_near(q: str, toks: list[str], idx: dict) -> str | None:
    if not (set(toks) & NEAR_TRIGGERS):
        return None
    geo, docs = idx.get("geo", {}), idx["docs"]
    if not geo:
        return "I have no coordinates yet — run the geocode step first (near-me needs lat/lon)."
    origin, label = _resolve_origin(q, toks, idx)
    if origin is None:
        return ('Tell me where to search from, e.g. "near Alkapuri" or '
                '"within 3 km of Karelibaug". (I don\'t have your live GPS location.)')

    rm = re.search(r"within\s+(\d+(?:\.\d+)?)\s*km", q.lower())
    radius = float(rm.group(1)) if rm else None
    cat = next((CATEGORY_SYNONYMS[t] for t in toks if t in CATEGORY_SYNONYMS), None)

    if cat:
        cand = [k for k in idx.get("category", {}).get(cat, []) if k in geo]
        kind = f"{cat} places"
        if not cand:                       # offline: demo services have no coords
            cand = [k for k in geo if k.startswith("area:")]
            kind = f"areas (no live {cat} coordinates yet — a live run adds service coords)"
    else:
        cand = [k for k in geo if k.startswith("area:")]
        kind = "areas"

    olat, olon = origin
    scored = []
    for k in cand:
        lat, lon = geo[k]
        d = _haversine(olat, olon, lat, lon)
        if d < 0.01:                       # skip the origin itself
            continue
        if radius is None or d <= radius:
            scored.append((d, k))
    scored.sort()
    top = scored[:6]
    if not top:
        return (f"Nothing within {radius} km of {label}." if radius
                else f"No {kind} found near {label}.")

    approx = any(docs[k].get("coordinates_source") == "demo_fixture" for _, k in top)
    head = (f"Nearest {kind} to **{label}**"
            + (f" (within {radius} km)" if radius else "") + ":")
    lines = []
    for d, k in top:
        doc = docs[k]
        nm = doc.get("name") or doc.get("title", "")
        tag = " _(approx demo coords)_" if doc.get("coordinates_source") == "demo_fixture" else ""
        lines.append(f"- **{nm}** — {d:.1f} km{tag}")
    note = ("\n\n_Distances are straight-line from "
            + ("approximate demo centroids" if approx else "OSM coordinates")
            + " — not road distance._")
    return head + "\n" + "\n".join(lines) + note


AREA_TRIGGERS = {"about", "tell", "overview", "details", "detail", "info",
                 "information", "area", "profile", "describe", "know"}

# group granular OSM categories into human sections for the profile
DISPLAY_GROUPS = [
    ("🍽️ Food & dining", {"food", "restaurant", "cafe", "bar", "pub", "bakery", "fast_food"}),
    ("🏥 Health & medical", {"health", "healthcare", "pharmacy", "hospital", "clinic",
                             "doctors", "dentist", "veterinary", "nursing_home"}),
    ("🎓 Education", {"education", "school", "college", "university", "kindergarten",
                     "driving_school", "language_school", "library"}),
    ("🏦 Finance", {"finance", "bank", "atm", "bureau_de_change", "insurance"}),
    ("🛍️ Shopping & retail", {"shopping", "clothes", "supermarket", "grocery", "convenience",
                              "electronics", "hardware", "furniture", "jewelry", "mobile_phone",
                              "shoes", "books", "gift"}),
    ("💼 Professionals & offices", {"office", "lawyer", "accountant", "estate_agent", "company",
                                    "it", "professional", "consulting", "financial"}),
    ("🔧 Home services & trades", {"electrician", "craft", "plumber", "carpenter", "tailor",
                                   "painter", "hvac"}),
    ("🚗 Auto", {"auto", "car", "car_repair", "motorcycle", "tyres", "fuel", "car_wash"}),
    ("💇 Beauty & salon", {"salon", "beauty", "hairdresser"}),
    ("🏨 Hospitality & tourism", {"hospitality", "hotel", "guest_house", "tourism",
                                  "attraction", "museum", "gallery", "guesthouse"}),
    ("🛕 Places & landmarks", {"historic", "park", "leisure", "place_of_worship",
                               "monument", "garden", "attraction", "theatre", "cinema"}),
]


def find_area_doc(toks: list[str], idx: dict) -> dict | None:
    """Longest area name (or alias) that appears in the query wins."""
    docs, qn = idx["docs"], " ".join(toks)
    best = None
    for k, d in docs.items():
        if not k.startswith("area:"):
            continue
        for nm in [d["name"], *d.get("aliases", [])]:
            nl = nm.lower()
            if re.search(rf"\b{re.escape(nl)}\b", qn) and (best is None or len(nl) > best[1]):
                best = (d, len(nl))
    return best[0] if best else None


def answer_area_profile(q: str, toks: list[str], idx: dict) -> str | None:
    """Deep 'tell me about <area>' — meta + service counts by category + places + news."""
    area = find_area_doc(toks, idx)
    if not area:
        return None
    # trigger on an explicit ask, or a bare/short area query ("Gotri")
    if not (AREA_TRIGGERS & set(toks) or len(toks) <= 3):
        return None

    docs = idx["docs"]
    name = area["name"]
    svc_keys = idx.get("locality", {}).get(name.lower(), [])
    svcs = [docs[k] for k in svc_keys]
    cats = Counter(s.get("category", "other") for s in svcs)

    # --- header / meta ---
    out = [f"# {name} — area profile"]
    meta = [f"a {area.get('type','locality')} of Vadodara"]
    if area.get("taluka"):
        meta.append(f"{area['taluka']} taluka")
    if area.get("zone_group"):
        meta.append(f"{area['zone_group']} zone")
    line = ", ".join(meta) + "."
    if area.get("pin_codes"):
        line += f" PIN {', '.join(area['pin_codes'])} (indicative)."
    c = area.get("coordinates")
    if c:
        src = area.get("coordinates_source", "")
        line += f" 📍 {c['lat']:.4f}, {c['lon']:.4f}" + (" (approx)" if src == "demo_fixture" else "")
    out.append(line)
    out.append(f"_Status: {area.get('status','?')} · confidence {area.get('confidence')}._")

    # --- businesses & services ---
    if svcs:
        out.append(f"\n## Businesses & services\n**{len(svcs)}** mapped across "
                   f"**{len(cats)}** categories (OpenStreetMap open data):")
        for label, keys in DISPLAY_GROUPS:
            n = sum(v for k, v in cats.items() if k in keys)
            if n:
                out.append(f"- {label}: **{n}**")
        top = cats.most_common(10)
        out.append("\n**Top categories:** " + ", ".join(f"{k} ({v})" for k, v in top))
        # a few named standouts (rated first, else any named)
        rated = sorted([s for s in svcs if s.get("halo_rating") is not None],
                       key=lambda s: s["halo_rating"], reverse=True)[:5]
        picks = rated or [s for s in svcs if s.get("name")][:5]
        if picks:
            out.append("\n**Some places here:** " + ", ".join(
                f"{s['name']} ({s.get('category')})" for s in picks))
    else:
        out.append("\n## Businesses & services\nNone mapped to this area yet — run the "
                   "live pipeline (`--live`) to populate from OpenStreetMap.")

    # --- landmarks / tourism ---
    landmark_cats = {"historic", "attraction", "museum", "place_of_worship", "park",
                     "hotel", "hospitality", "tourism", "gallery", "monument"}
    landmarks = [s["name"] for s in svcs if s.get("category") in landmark_cats][:8]
    if landmarks:
        out.append("\n## Landmarks & places of interest\n" + ", ".join(landmarks))

    # --- news mentioning this area ---
    news = [docs[k] for k in docs if k.startswith("news_event:")
            and name in docs[k].get("locations_involved", [])]
    news.sort(key=lambda e: e.get("date", ""), reverse=True)
    if news:
        out.append("\n## Recent news mentioning this area")
        for e in news[:4]:
            st = "✅" if e.get("status") == "confirmed" else "🟡"
            demo = " _(demo)_" if e.get("is_demo") else ""
            out.append(f"- {st} {e.get('date','')} — {e.get('title','')}{demo}")

    out.append("\n_Counts reflect what is mapped in OpenStreetMap (open data), not an "
               "official VMC business registry. Coverage grows every run._")
    return "\n".join(out)


TRIP_TRIGGERS = {"trip", "trips", "visit", "tourist", "tourism", "weekend",
                 "picnic", "getaway", "outing", "spot", "spots", "sightseeing",
                 "explore", "nearby", "day"}
MOOD_WORDS = {"peaceful", "spiritual", "adventure", "family", "picnic", "scenic",
              "heritage", "culture", "fun", "romantic", "relax", "relaxing"}
MOOD_ALIAS = {"relax": "peaceful", "relaxing": "peaceful", "romantic": "peaceful",
              "culture": "heritage", "religious": "spiritual", "temple": "spiritual"}


def answer_trips(q: str, toks: list[str], idx: dict) -> str | None:
    if not (TRIP_TRIGGERS & set(toks) or MOOD_WORDS & set(toks)):
        return None
    docs = idx["docs"]
    trips = [docs[k] for k in docs if k.startswith("trip_spot:")]
    if not trips:
        return None
    tset = set(toks) | {t[:-1] for t in toks if len(t) > 3 and t.endswith("s")}
    moods = {MOOD_ALIAS.get(t, t) for t in tset if t in MOOD_WORDS or t in MOOD_ALIAS}
    rm = re.search(r"within\s+(\d+(?:\.\d+)?)\s*km", q.lower())
    max_km = float(rm.group(1)) if rm else None
    typ = next((t for t in ("temple", "fort", "heritage", "museum", "lake_dam",
                            "hill", "park", "picnic", "attraction") if t in tset), None)

    cand = trips
    if moods:
        m = [t for t in cand if moods & set(t.get("best_for_mood", []))]
        cand = m or cand
    if typ:
        cand = [t for t in cand if t.get("type") == typ] or cand
    if max_km is not None:
        cand = [t for t in cand if (t.get("distance_km") or 1e9) <= max_km]
    cand.sort(key=lambda t: t.get("distance_km") or 1e9)
    if not cand:
        return "No trip spots match that yet — try a live run or widen the distance."

    head = "Trip ideas around Vadodara"
    if moods:
        head += f" ({', '.join(sorted(moods))})"
    if max_km:
        head += f" within {max_km:.0f} km"
    lines = []
    for t in cand[:6]:
        demo = " _(demo)_" if t.get("is_demo") else ""
        lines.append(f"- **{t['name']}** — {t.get('type','')}, ~{t.get('distance_km')} km · "
                     f"{', '.join(t.get('best_for_mood', []))}{demo}\n"
                     f"  {t.get('description_summary') or t.get('how_to_reach','')}")
    return head + ":\n" + "\n".join(lines)


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

    # Intent: TRIPS — mood/tourist words ("peaceful weekend trip", "temples nearby").
    trips = answer_trips(q, toks, idx)
    if trips is not None:
        return trips

    # Intent: NEAR-ME — proximity words ("near", "within N km of", "closest").
    near = answer_near(q, toks, idx)
    if near is not None:
        return near

    # Intent: NEWS — a news tag or "what happened / news / event" is mentioned.
    news = answer_news(q, toks, idx)
    if news is not None:
        return news

    # Intent: AREA PROFILE — "tell me about Gotri" / "Gotri area" / bare "Gotri".
    # (Before service search so an explicit area ask gets the full profile, while
    #  "best food in Gotri" — no area-trigger word — still routes to service.)
    prof = answer_area_profile(q, toks, idx)
    if prof is not None:
        return prof

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
