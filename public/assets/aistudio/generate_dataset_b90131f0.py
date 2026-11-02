"""Generate a SYNTHETIC CRM lead dataset (no real personal data) incl. deliberate data-quality issues."""
import random
from datetime import date, timedelta
from pathlib import Path

import pandas as pd

import config

FIRST = ["Aarav", "Diya", "Rahul", "Sneha", "Vijay", "Anita", "Suresh", "Kavya", "Imran", "Pooja",
         "Nikhil", "Ritu", "Manoj", "Swathi", "Harish", "Farah", "Deepak", "Tanya", "Gokul", "Isha"]
LAST = ["Sharma", "Kumar", "Nair", "Reddy", "Patel", "Khan", "Das", "Iyer", "Singh", "Menon"]
COMPANIES = ["Zenith Textiles", "BlueOak Logistics", "Nimbus Foods", "Orbit Pharma", "Kaveri Agro",
             "Praxis Software", "Lotus Retail", "Vertex Steel", "Pearl Hospitality", "Helix Auto"]
INDUSTRIES = ["Manufacturing", "Logistics", "Retail", "Healthcare", "IT Services", "Hospitality"]


def build(n=120, seed=42, base=date(2026, 10, 15)):
    rnd = random.Random(seed)
    rows = []
    for i in range(1, n + 1):
        first, last = rnd.choice(FIRST), rnd.choice(LAST)
        rows.append({
            "lead_id": f"L{i:04d}", "name": f"{first} {last}",
            "company": rnd.choice(COMPANIES), "industry": rnd.choice(INDUSTRIES),
            "email": f"{first}.{last}{i}@example.com".lower(),
            "phone": rnd.choice(["", "+91 "]) + str(rnd.randint(6, 9)) + "".join(str(rnd.randint(0, 9)) for _ in range(9)),
            "source": rnd.choice(list(config.SOURCE_POINTS)), "region": rnd.choice(config.REGIONS),
            "created_date": (base - timedelta(days=rnd.randint(0, 60))).isoformat(),
            "status": rnd.choices(config.VALID_STATUSES, weights=[40, 25, 15, 8, 12])[0],
            "budget": rnd.choice([30000, 80000, 150000, 400000, 600000, 900000, 1200000, 2500000]),
            "company_size": rnd.choice([3, 8, 15, 40, 75, 150, 300, 800]),
            "timeline": rnd.choice(list(config.TIMELINE_POINTS)),
            "website_visits": rnd.randint(0, 9), "emails_opened": rnd.randint(0, 8),
        })
    # ---- deliberate data-quality issues (for testing validation/dedupe) ----
    for k in range(6):                                   # 6 duplicate emails, later date
        d = dict(rows[k]); d["lead_id"] = f"L{n + 1 + k:04d}"
        d["created_date"] = (date.fromisoformat(d["created_date"]) + timedelta(days=3)).isoformat()
        rows.append(d)
    for k in (10, 11, 12, 13):  rows[k]["email"] = rows[k]["email"].replace("@", "")   # bad email
    for k in (20, 21, 22):      rows[k]["phone"] = ""                                   # missing phone
    for k in (30, 31):          rows[k]["created_date"] = "not-a-date"                  # bad date
    for k in (40, 41):          rows[k]["budget"] = -5000                               # negative budget
    rows[50]["source"] = "Billboard"                                                    # unknown source
    return pd.DataFrame(rows)


if __name__ == "__main__":
    out = Path(config.DEFAULT_INPUT)
    out.parent.mkdir(parents=True, exist_ok=True)
    df = build()
    df.to_csv(out, index=False)
    print(f"Wrote {len(df)} synthetic leads to {out}")
