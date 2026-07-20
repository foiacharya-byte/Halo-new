"""
Sanity tests (stdlib unittest, no deps). Run: python3 -m unittest -v

These lock in the non-negotiables so a future change can't silently break them.
"""
import json
import os
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from halo.util import normalize_phone, phone_key, slugify, make_id  # noqa: E402

# demo/sample data is OFF by default now (no demo data in live datasets); the
# offline tests below opt back in so there's something to exercise the logic on.
FIX_ENV = {**os.environ, "HALO_USE_FIXTURES": "1"}


def _run(script: str, *args, fixtures: bool = False):
    env = FIX_ENV if fixtures else os.environ
    return subprocess.run([sys.executable, str(ROOT / script), *args],
                          capture_output=True, text=True, env=env)


class TestUtil(unittest.TestCase):
    def test_phone_indian_mobile(self):
        self.assertEqual(normalize_phone("+91 98250 12345"), "+919825012345")
        self.assertEqual(normalize_phone("0265-2345678"), "+912652345678")
        self.assertIsNone(normalize_phone("hello"))
        self.assertIsNone(normalize_phone("123"))

    def test_phone_key_dedup(self):
        # same number written two ways must dedupe to one key
        self.assertEqual(phone_key("98250-12345"), phone_key("+91 9825012345"))

    def test_ids_stable(self):
        self.assertEqual(make_id("area", "Alkapuri", "vadodara"),
                         make_id("area", "Alkapuri", "vadodara"))
        self.assertEqual(slugify("Old Padra Road"), "old-padra-road")


class TestPipeline(unittest.TestCase):
    def test_extract_validate_index(self):
        for script in ("scripts/extract/extract_areas.py",
                       "scripts/validate/validate_areas.py",
                       "scripts/index/build_index.py"):
            r = subprocess.run([sys.executable, str(ROOT / script)],
                               capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, msg=r.stderr)

        areas = json.loads((ROOT / "data/processed/areas.validated.json").read_text())
        self.assertGreater(len(areas), 10)
        for a in areas:
            self.assertTrue(a["id"] and a["name"])
            self.assertTrue(a["source_ids"], "every record must carry provenance")
            self.assertIn("last_updated", a, "every record must carry freshness")

    def test_query_runs(self):
        r = subprocess.run([sys.executable, str(ROOT / "scripts/query/ask.py"),
                            "tell me about Alkapuri"], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, msg=r.stderr)
        self.assertIn("Alkapuri", r.stdout)

    def test_variant_merge(self):
        subprocess.run([sys.executable, str(ROOT / "scripts/extract/extract_areas.py")], check=True)
        subprocess.run([sys.executable, str(ROOT / "scripts/validate/validate_areas.py")], check=True)
        names = {a["name"] for a in json.loads(
            (ROOT / "data/processed/areas.validated.json").read_text())}
        # spelling variants must have folded into one canonical record
        self.assertIn("Bhayli", names)
        self.assertNotIn("Bhayali", names)
        self.assertNotIn("Bhaili", names)


class TestServices(unittest.TestCase):
    def setUp(self):
        subprocess.run([sys.executable, str(ROOT / "scripts/extract/extract_services.py")],
                       check=True, env=FIX_ENV)
        subprocess.run([sys.executable, str(ROOT / "scripts/validate/validate_services.py")], check=True)
        self.svc = {s["name"]: s for s in json.loads(
            (ROOT / "data/processed/services.validated.json").read_text())}

    def test_demo_is_flagged_and_no_consent(self):
        for s in self.svc.values():
            self.assertTrue(s["is_demo"], "fixture records must be marked demo")
            self.assertFalse(s["contact_consent"], "phones must never be auto-published")
            self.assertEqual(s["source_ids"], ["src.seed.curated"],
                             "demo must not claim a real source")

    def test_cross_platform_dedupe(self):
        # the two 'AC Care' copies (same phone) must collapse to one, both platforms kept
        ac = self.svc.get("Demo AC Care Services")
        self.assertIsNotNone(ac)
        self.assertEqual(sorted(ac["source_platforms"]), ["demo_dir_A", "demo_dir_B"])
        self.assertEqual(ac["rating_count"], 310)  # 220 + 90 summed across platforms

    def test_five_star_thresholds(self):
        # high rating but only 12 reviews must NOT earn the badge
        self.assertFalse(self.svc["Demo Blue Ocean Restaurant"]["halo_five_star"])
        # strong + many reviews + recent does
        self.assertTrue(self.svc["Demo AC Care Services"]["halo_five_star"])

    def test_closed_penalised(self):
        cafe = self.svc["Demo Old Town Cafe"]
        self.assertTrue(cafe["permanently_closed"])
        self.assertLess(cafe["halo_rating"], 2.0)  # closed + stale crushes the score


class TestInfra(unittest.TestCase):
    def test_network_gate_off_by_default(self):
        from halo import config
        config.load.cache_clear()
        self.assertFalse(config.network_allowed(),
                         "sandbox config must keep allow_network=false")

    def test_ledger_roundtrip(self):
        from halo import provenance
        provenance.record("src.test.demo", "usable", "unit test", records=3)
        md = provenance.render_markdown()
        self.assertIn("src.test.demo", md)

    def test_osm_apis_bypass_crawler_robots(self):
        # OSM Nominatim/Overpass are APIs -> robots crawl rules must NOT gate them
        from halo import config
        config.load.cache_clear()
        self.assertFalse(config.get("osm", "respect_robots", default=False),
                         "OSM must use API usage-policy (rate limit + UA), not robots.txt")


class TestOsmResilience(unittest.TestCase):
    """One geocode miss must NOT blank the whole OSM source (simulated, no network)."""

    def setUp(self):
        from scripts.extract import services_osm as osm
        from halo import config
        self.osm = osm
        self._orig = (osm.geocode, osm._overpass_around, config.network_allowed)
        osm.config.network_allowed = lambda: True   # pretend we're online

    def tearDown(self):
        from halo import config
        self.osm.geocode, self.osm._overpass_around, config.network_allowed = self._orig

    def _ledger_status(self):
        from halo import provenance
        return provenance._read().get("src.osm.overpass", {}).get("status")

    def test_one_locality_ok_others_empty_is_not_blocked(self):
        osm = self.osm
        osm.geocode = lambda loc: (((22.3, 73.2), "ok") if loc == "Karelibaug"
                                   else (None, "empty"))
        osm._overpass_around = lambda loc, lat, lon: ([{
            "locality": loc, "name": "Real Shop", "category": "food",
            "coordinates": {"lat": lat, "lon": lon},
            "source_link": "https://www.openstreetmap.org/node/1", "is_demo": False,
        }], "ok")
        records = osm.fetch_localities(["Karelibaug", "Alkapuri"])
        self.assertEqual(len(records), 1, "the working locality must still yield POIs")
        self.assertIn(self._ledger_status(), ("usable", "partial"))
        self.assertNotEqual(self._ledger_status(), "blocked")

    def test_all_network_errors_is_blocked(self):
        osm = self.osm
        osm.geocode = lambda loc: (None, "error")
        records = osm.fetch_localities(["Karelibaug", "Alkapuri"])
        self.assertEqual(records, [])
        self.assertEqual(self._ledger_status(), "blocked")


class TestGeocodeNearMe(unittest.TestCase):
    def setUp(self):
        for s in ("scripts/extract/extract_areas.py", "scripts/validate/validate_areas.py",
                  "scripts/extract/geocode_areas.py", "scripts/index/build_index.py"):
            subprocess.run([sys.executable, str(ROOT / s)], check=True)

    def test_coords_backfilled_and_flagged(self):
        areas = json.loads((ROOT / "data/processed/areas.validated.json").read_text())
        withc = [a for a in areas if a.get("coordinates")]
        self.assertGreater(len(withc), 5, "geocode should fill several localities")
        for a in withc:
            self.assertIn(a["coordinates_source"], ("demo_fixture", "openstreetmap"))
            self.assertIsNotNone(a["coordinates"]["lat"])

    def test_index_has_geo(self):
        idx = json.loads((ROOT / "data/processed/index.json").read_text())
        self.assertIn("geo", idx)
        self.assertTrue(any(k.startswith("area:") for k in idx["geo"]))

    def test_near_me_query(self):
        r = subprocess.run([sys.executable, str(ROOT / "scripts/query/ask.py"),
                            "areas near Alkapuri"], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, msg=r.stderr)
        self.assertRegex(r.stdout, r"\d+\.\d+ km", "near-me answer must show distances in km")

    def test_area_profile(self):
        # full pipeline so services are assigned to localities
        subprocess.run([sys.executable, str(ROOT / "scripts/run_pipeline.py")],
                       check=True, env=FIX_ENV)
        r = subprocess.run([sys.executable, str(ROOT / "scripts/query/ask.py"),
                            "tell me about Karelibaug"], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, msg=r.stderr)
        self.assertIn("area profile", r.stdout)
        self.assertIn("Businesses & services", r.stdout)
        self.assertIn("Top categories", r.stdout)


class TestNoDemoByDefault(unittest.TestCase):
    def test_services_empty_without_fixtures(self):
        # default (no HALO_USE_FIXTURES, network off) must write ZERO demo rows
        r = _run("scripts/extract/extract_services.py")
        self.assertEqual(r.returncode, 0, msg=r.stderr)
        rows = json.loads((ROOT / "data/processed/services.json").read_text(encoding="utf-8"))
        self.assertEqual(rows, [], "no demo data may enter services when fixtures are off")

    def test_fixtures_opt_in_still_flagged_demo(self):
        r = _run("scripts/extract/extract_services.py", fixtures=True)
        self.assertEqual(r.returncode, 0, msg=r.stderr)
        rows = json.loads((ROOT / "data/processed/services.json").read_text(encoding="utf-8"))
        self.assertTrue(rows and all(x["is_demo"] for x in rows))


class TestTranslate(unittest.TestCase):
    def test_english_passthrough(self):
        from halo import translate
        txt, eng, ok = translate.translate("Vadodara is a city", "en")
        self.assertTrue(ok)
        self.assertEqual(txt, "Vadodara is a city")

    def test_gujarati_without_engine_keeps_original(self):
        from halo import translate
        original = "વડોદરા એક શહેર છે"
        txt, eng, ok = translate.translate(original, "gu")
        self.assertFalse(ok, "no engine in sandbox -> must NOT fabricate a translation")
        self.assertEqual(txt, original, "original text must be kept verbatim")
        self.assertEqual(eng, "none")


class TestTrips(unittest.TestCase):
    def setUp(self):
        subprocess.run([sys.executable, str(ROOT / "scripts/extract/extract_trips.py")],
                       check=True, env=FIX_ENV)
        subprocess.run([sys.executable, str(ROOT / "scripts/validate/validate_trips.py")], check=True)
        self.spots = json.loads(
            (ROOT / "data/processed/trip_spots.validated.json").read_text(encoding="utf-8"))

    def test_spots_have_distance_and_mood(self):
        self.assertGreater(len(self.spots), 3)
        for s in self.spots:
            self.assertIsNotNone(s["distance_km"])
            self.assertTrue(s["best_for_mood"])
        # sorted nearest first
        dists = [s["distance_km"] for s in self.spots]
        self.assertEqual(dists, sorted(dists))

    def test_grid_tiles_cover_bbox(self):
        from scripts.extract.services_osm import _grid_tiles
        tiles = list(_grid_tiles((22.0, 73.0, 22.4, 73.4), 4))
        self.assertEqual(len(tiles), 16)                 # 4x4
        # tiles stay within the bbox
        for s, w, n, e in tiles:
            self.assertGreaterEqual(s, 22.0)
            self.assertLessEqual(e, 73.4)


class TestNews(unittest.TestCase):
    def setUp(self):
        subprocess.run([sys.executable, str(ROOT / "scripts/extract/extract_areas.py")], check=True)
        subprocess.run([sys.executable, str(ROOT / "scripts/validate/validate_areas.py")], check=True)
        subprocess.run([sys.executable, str(ROOT / "scripts/extract/extract_news.py")],
                       check=True, env=FIX_ENV)
        subprocess.run([sys.executable, str(ROOT / "scripts/validate/validate_news.py")], check=True)
        self.events = json.loads((ROOT / "data/processed/news_events.validated.json").read_text())

    def test_flood_event_confirmed_by_two_sources(self):
        floods = [e for e in self.events if "flood" in e["tags"]]
        self.assertTrue(floods)
        self.assertTrue(all(e["status"] == "confirmed" for e in floods),
                        "two flood articles from two sources must cluster -> confirmed")
        # they must share one cluster_id
        self.assertEqual(len({e["cluster_id"] for e in floods}), 1)

    def test_locations_and_demo_flag(self):
        flood = next(e for e in self.events if "flood" in e["tags"])
        self.assertIn("Sama", flood["locations_involved"])
        self.assertTrue(all(e["is_demo"] for e in self.events))


if __name__ == "__main__":
    unittest.main()
