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


if __name__ == "__main__":
    unittest.main()
