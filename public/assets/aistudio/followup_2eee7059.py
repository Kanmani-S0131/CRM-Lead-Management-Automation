"""Module 5: follow-up due dates and SLA breach flags."""
import pandas as pd

import config


def add_followup(df, as_of):
    df = df.copy()
    as_of = pd.Timestamp(as_of).normalize()
    if df.empty:
        return df
    open_mask = df["status"].isin(config.OPEN_STATUSES)
    due = df["created_date"] + pd.to_timedelta(df["grade"].map(config.SLA_DAYS), unit="D")
    df["follow_up_due"] = due.where(open_mask)
    breach = df["status"].isin(config.SLA_STATUSES) & (due < as_of)
    df["sla_breached"] = breach
    df["days_overdue"] = ((as_of - due).dt.days).where(breach, 0).astype(int)
    return df
