"""Module 6: output files and Excel summary report."""
import logging
from pathlib import Path

import pandas as pd

log = logging.getLogger(__name__)


def build_summaries(df):
    by_grade = df.groupby("grade").agg(leads=("lead_id", "count"), avg_score=("lead_score", "mean"),
                                       total_budget=("budget", "sum")).round(1).reset_index()
    by_source = df.groupby("source").agg(
        leads=("lead_id", "count"), avg_score=("lead_score", "mean"),
        hot_leads=("grade", lambda s: (s == "Hot").sum()),
        converted=("status", lambda s: (s == "Converted").sum())).reset_index()
    by_source["conversion_rate_pct"] = (by_source["converted"] / by_source["leads"] * 100).round(1)
    by_source["avg_score"] = by_source["avg_score"].round(1)
    open_df = df[df["owner"] != "N/A (closed)"]
    by_owner = open_df.groupby("owner").agg(
        open_leads=("lead_id", "count"), hot_leads=("grade", lambda s: (s == "Hot").sum()),
        sla_breaches=("sla_breached", "sum")).reset_index()
    overdue = df[df["sla_breached"]].sort_values("days_overdue", ascending=False)[
        ["lead_id", "name", "region", "grade", "owner", "follow_up_due", "days_overdue"]]
    return {"By Grade": by_grade, "By Source": by_source, "By Owner": by_owner, "SLA Breaches": overdue}


def write_outputs(processed, rejected, duplicates, out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    processed.to_csv(out / "processed_leads.csv", index=False)
    rejected.to_csv(out / "rejected_leads.csv", index=False)
    duplicates.to_csv(out / "duplicate_leads.csv", index=False)
    if not processed.empty:
        with pd.ExcelWriter(out / "lead_summary.xlsx", engine="openpyxl") as xw:
            processed.to_excel(xw, sheet_name="All Leads", index=False)
            for name, frame in build_summaries(processed).items():
                frame.to_excel(xw, sheet_name=name, index=False)
    log.info("Outputs written to %s", out)
