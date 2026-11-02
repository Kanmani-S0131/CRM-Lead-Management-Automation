"""Unit + end-to-end tests.  Run:  python -m unittest -v"""
import tempfile
import unittest

import pandas as pd

import config
import generate_dataset
from assignment import add_assignments
from dedupe import remove_duplicates
from followup import add_followup
from pipeline import run_pipeline
from scoring import add_scores, grade_from_score
from validators import clean_phone, validate_row

BASE = dict(lead_id="T1", name="Test User", email="a@b.com", phone="9876543210", source="Referral",
            region="North", created_date="2026-10-01", status="New", budget="1200000",
            company_size="250", timeline="0-1 Months", website_visits="6", emails_opened="5")


def make(**kw):
    clean, reason = validate_row({**BASE, **kw})
    assert clean is not None, reason
    return pd.DataFrame([clean])


class TestValidation(unittest.TestCase):
    def test_phone_formats(self):
        self.assertEqual(clean_phone("+91 98765 43210"), "9876543210")
        self.assertIsNone(clean_phone("12345"))
        self.assertIsNone(clean_phone(None))

    def test_rejections(self):
        for field, val, msg in [("email", "bad.email", "Invalid email"), ("phone", "", "Missing phone"),
                                ("created_date", "xx", "Invalid created_date"), ("budget", "-1", "Invalid budget"),
                                ("source", "Billboard", "Unknown source")]:
            clean, reason = validate_row({**BASE, field: val})
            self.assertIsNone(clean)
            self.assertIn(msg, reason)


class TestScoring(unittest.TestCase):
    def test_max_score_is_hot(self):
        df = add_scores(make())
        self.assertEqual(df.loc[0, "lead_score"], 100)
        self.assertEqual(df.loc[0, "grade"], "Hot")

    def test_min_score_is_cold(self):
        df = add_scores(make(source="Cold Call", budget="50000", company_size="5", website_visits="0",
                             emails_opened="0", timeline="6+ Months"))
        self.assertEqual(df.loc[0, "lead_score"], 15)   # 5+5+3+0+2
        self.assertEqual(df.loc[0, "grade"], "Cold")

    def test_grade_boundaries(self):
        self.assertEqual([grade_from_score(s) for s in (70, 69, 40, 39)], ["Hot", "Warm", "Warm", "Cold"])


class TestDedupe(unittest.TestCase):
    def test_keeps_earliest(self):
        a, b = make(lead_id="A", created_date="2026-10-05"), make(lead_id="B", created_date="2026-10-01")
        unique, dups = remove_duplicates(pd.concat([a, b], ignore_index=True))
        self.assertEqual(unique.loc[0, "lead_id"], "B")
        self.assertEqual(dups.loc[0, "lead_id"], "A")


class TestAssignmentAndSLA(unittest.TestCase):
    def test_hot_goes_to_senior_and_closed_not_assigned(self):
        hot = add_assignments(add_scores(make()))
        self.assertEqual(hot.loc[0, "owner"], "Arjun Rao")
        closed = add_assignments(add_scores(make(status="Lost")))
        self.assertEqual(closed.loc[0, "owner"], "N/A (closed)")

    def test_round_robin_rotates_juniors(self):
        rows = [make(lead_id=f"C{i}", email=f"c{i}@b.com", source="Cold Call", budget="1000", company_size="2",
                     website_visits="0", emails_opened="0", timeline="6+ Months") for i in range(3)]
        df = add_assignments(add_scores(pd.concat(rows, ignore_index=True)))
        self.assertEqual(list(df["owner"]), ["Meena Iyer", "Karan Singh", "Meena Iyer"])

    def test_sla_breach(self):
        df = add_followup(add_assignments(add_scores(make(created_date="2026-10-01"))), "2026-10-10")
        self.assertTrue(df.loc[0, "sla_breached"])          # Hot SLA = 1 day
        self.assertEqual(df.loc[0, "days_overdue"], 8)      # due 10-02, as-of 10-10
        df2 = add_followup(add_assignments(add_scores(make(created_date="2026-10-01", status="Contacted"))), "2026-10-10")
        self.assertFalse(df2.loc[0, "sla_breached"])


class TestEndToEnd(unittest.TestCase):
    def test_counts_reconcile(self):
        with tempfile.TemporaryDirectory() as tmp:
            raw = f"{tmp}/raw.csv"
            generate_dataset.build().to_csv(raw, index=False)
            processed, rejected, dups, stats = run_pipeline(raw, f"{tmp}/out", "2026-11-02")
            self.assertEqual(stats["input_rows"], 126)
            self.assertEqual(stats["valid"] + stats["rejected"], stats["input_rows"])
            self.assertEqual(stats["processed"] + stats["duplicates"], stats["valid"])
            self.assertEqual(stats["duplicates"], 6)
            self.assertEqual(stats["rejected"], 12)   # 4 email + 3 phone + 2 date + 2 budget + 1 source
            self.assertTrue(processed["lead_score"].between(0, 100).all())


if __name__ == "__main__":
    unittest.main()
