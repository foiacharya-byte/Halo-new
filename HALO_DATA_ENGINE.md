# Halo Vadodara — City Data Engine

*The data + search layer for Halo ("ae halo"), Vadodara's homegrown directory.*
*This document is written so a non-technical founder can read it end-to-end.*

> **Relationship to `HALO_PROJECT_MEMORY.md`:** that file describes the **front-end
> directory** (`index_v22.html`, the beta users see). *This* project is the **engine
> behind it** — how we collect, clean, cross-check and search Vadodara's data so the
> directory (and one day "Halo AI") always has something trustworthy to show.

---

## 1. What this engine does (in one paragraph)

It turns messy, scattered, **open** information about Vadodara — official ward lists,
public directories, news sites, tourism blogs — into **four clean datasets** (areas,
services, news events, trip spots), each record carrying its **sources** and a
**freshness timestamp**. On top of those datasets sits a small **search/answer layer**
so Halo can respond to questions like *"best 5-star AC repair in Alkapuri"* or
*"peaceful place within 10 km of Karelibaug"* with a clean, sourced summary.

---

## 2. Non-negotiables (inherited, load-bearing)

These come straight from the project's trust posture. Code enforces them:

1. **No scraped phone number is ever auto-published as a contact button.** Scraped
   numbers are stored as `contact_consent: false` **leads**, never as public contact
   data. A business must claim + consent first. (See `services` schema.)
2. **Provenance on every record.** Every row has `source_links[]`. Nothing enters the
   dataset "because the model said so."
3. **Freshness on every record.** Every row has `last_updated`. Halo always knows how
   old a fact is.
4. **Verified vs. inferred is labelled**, never blurred. `confidence` + `needs_review`
   fields carry this.
5. **Open sources only.** We fetch only pages that permit automated access (we honour
   `robots.txt` — see `scripts/extract/http.py`). No logins, no paywalls, no bypass.
6. **DPDP-respecting.** Personal data (phone numbers) is purpose-limited, consent-gated,
   and removable. A `takedown` flag hard-hides any record on request.

---

## 3. Entity model

Four entities. Full JSON Schemas live in `halo/schema/`.

| Entity | One-line purpose | Key fields |
|---|---|---|
| **AREA** | wards / localities / villages of Vadodara | `name, type, parent_zone, pin_codes[], coordinates, source_ids` |
| **SERVICE** | shops, restaurants, professionals (5★ focus) | `name, category, address, locality, phone_numbers[], contact_consent, rating_score, rating_count, halo_rating, source_platforms[], last_seen` |
| **NEWS_EVENT** | floods, civic changes, crime, politics | `title, short_summary, date, tags[], locations_involved[], source_links[], sentiment, status` |
| **TRIP_SPOT** | micro-travel within ~10–50 km | `name, distance_km, type, best_for_mood[], how_to_reach, source_links[]` |

Every entity also carries the **common envelope**: `id, source_links[], last_updated,
confidence, needs_review, takedown`.

---

## 4. The six phases (and where they live in code)

| Phase | What happens | Where |
|---|---|---|
| **0 · Frame** | entity model + storage format | `halo/schema/`, `halo/models.py` |
| **1 · Source discovery** | catalogue of open sources w/ trust levels | `sources_catalogue/sources.json` |
| **2 · Extraction** | one extractor per source type, re-runnable | `scripts/extract/` |
| **3 · Cross-validation** | 2-source rule, dedupe, Halo_rating, event clustering | `scripts/validate/` |
| **4 · Dataset & index** | write `*.json` + build search indexes | `data/processed/`, `scripts/index/` |
| **5 · Answering** | interpret intent → query → clean summary | `scripts/query/ask.py` |
| **6 · Ongoing update** | scheduled re-runs + change log | `scripts/run_pipeline.py`, `data/processed/CHANGELOG.md` |

---

## 5. Folder structure

```
Halo-new/
├── HALO_DATA_ENGINE.md          ← you are here (architecture)
├── HALO_PROJECT_MEMORY.md       ← front-end / product memory (pre-existing)
├── requirements.txt             ← stdlib only; optional extras noted
├── halo/
│   ├── models.py                ← entity dataclasses + common envelope
│   ├── util.py                  ← phone/text normalisers, ids, timestamps
│   └── schema/                  ← JSON Schemas (area/service/news/trip)
├── sources_catalogue/
│   └── sources.json             ← Phase 1: open-source catalogue
├── data/
│   ├── raw/                     ← untouched fetched pages (audit trail)
│   └── processed/               ← clean datasets + indexes + changelog
├── scripts/
│   ├── extract/                 ← Phase 2: one extractor per source type
│   ├── validate/                ← Phase 3: cross-checks + Halo_rating
│   ├── index/                   ← Phase 4: build search indexes
│   ├── query/                   ← Phase 5: ask Halo a question
│   └── run_pipeline.py          ← Phase 6: run everything, write changelog
└── tests/                       ← sanity tests (stdlib unittest)
```

---

## 6. How to run it (today, zero installs)

```bash
# 1. Build the areas dataset from the committed open-source seed
python3 scripts/extract/extract_areas.py

# 2. Cross-validate (2-source rule) and score
python3 scripts/validate/validate_areas.py

# 3. Build the search index
python3 scripts/index/build_index.py

# 4. Ask Halo something
python3 scripts/query/ask.py "tell me about Alkapuri"
python3 scripts/query/ask.py "areas in the West zone"

# Or run the whole pipeline + write a changelog entry:
python3 scripts/run_pipeline.py
```

Everything above runs offline against the **committed seed**. Live fetching is opt-in
(`--live`) and only hits sources that permit it.

---

## 7. Why it's built this way (design notes for the founder)

- **Stdlib-only core** → it runs on any machine, any free CI, forever, at zero cost.
  Heavier parsers (PDF, HTML) are *optional* and isolated so the core never breaks.
- **Seed-first, live-later** → we ship a working dataset immediately and turn on live
  crawls source-by-source, only after each one is proven to parse cleanly.
- **Re-runnable, not one-shot** → every extractor is idempotent, so nightly/weekly jobs
  just refresh `last_updated` and re-score, exactly as Phase 6 requires.
- **Trust is in the schema, not the vibes** → consent, provenance, freshness and
  verified-vs-inferred are *fields*, so they can't be forgotten.

---

## 8. Roadmap (data-engine specific)

1. ✅ Scaffold, schema, areas extractor + validator + index + query.
2. ✅ Areas expanded to 90 places (localities + taluka villages) with
   `taluka`/`status`/`zone_group`, alias-merge for spelling variants, and
   honest `src.seed.curated` provenance (status `single_source_needs_review`).
3. ✅ Services extractor: real OpenStreetMap (Nominatim→Overpass) client +
   dedupe by phone+name + `halo_rating`/`halo_five_star`. Runs on Karelibaug &
   Alkapuri; `--all` scales to every locality.
   ⚠️ **Network note:** the OSM client is real, but *this* sandbox's network
   policy blocks `nominatim`/`overpass` (403 at the gateway), so the extractor
   falls back to a clearly-labelled **demo fixture** (`is_demo:true`, fake
   phones, `src.seed.curated`). Run `--live` where OSM is reachable to get real
   records with real provenance.
4. Promotion path: corroborate seed places against catalogued village/locality
   sources → lift `status` to `multi_source` / `confirmed_official`.
5. News extractor (RSS first — cheapest, cleanest) → event clustering.
6. Trip-spot extractor (tourism portals/blogs) → mood tagging.
7. Geocode areas from OpenStreetMap/Nominatim (open) to fill `coordinates`.
8. Nightly (news) / weekly (directories) scheduled refresh via free CI.

## 9. Run the services step

```bash
python3 scripts/extract/extract_services.py            # demo, Karelibaug + Alkapuri
python3 scripts/extract/extract_services.py --live     # real OSM if reachable
python3 scripts/extract/extract_services.py --all --live   # every locality
python3 scripts/validate/validate_services.py          # dedupe + halo_rating
python3 scripts/query/ask.py "best 5-star electrician in Alkapuri"
```
