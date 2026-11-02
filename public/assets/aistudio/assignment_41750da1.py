"""Module 4: region-based round-robin assignment (Hot -> Senior reps, others -> Junior reps)."""
import logging
from collections import defaultdict

import config

log = logging.getLogger(__name__)


def add_assignments(df):
    df = df.copy()
    counters = defaultdict(int)
    owners = []
    for _, row in df.iterrows():
        if row["status"] not in config.OPEN_STATUSES:
            owners.append("N/A (closed)")
            continue
        level = "Senior" if row["grade"] == "Hot" else "Junior"
        team = config.REPS[row["region"]]
        pool = [r for r in team if r["level"] == level] or team
        key = (row["region"], level)
        owners.append(pool[counters[key] % len(pool)]["name"])
        counters[key] += 1
    df["owner"] = owners
    log.info("Assigned %d open leads", sum(o != "N/A (closed)" for o in owners))
    return df
