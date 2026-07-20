"""
Sanity tests (stdlib unittest, no deps). Run: python3 -m unittest -v

These lock in the non-negotiables so a future change can't silently break them.
"""
import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from halo.util import normalize_phone, phone_key, slugify, make_id  # noqa: E402


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
        subprocess.run([sys.executable, str(ROOT / "scripts/extract/extract_services.py")], check=True)
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


if __name__ == "__main__":
    unittest.main()
