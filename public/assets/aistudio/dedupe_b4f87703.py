"""Module 2: duplicate detection (same email = same lead; earliest record is kept)."""
import logging

log = logging.getLogger(__name__)


def remove_duplicates(df):
    if df.empty:
        return df.copy(), df.copy()
    ordered = df.sort_values(["created_date", "lead_id"], kind="stable")
    dup_mask = ordered.duplicated(subset="email", keep="first")
    unique, dups = ordered[~dup_mask].copy(), ordered[dup_mask].copy()
    dups["reject_reason"] = "Duplicate email"
    log.info("Dedupe: %d unique, %d duplicates removed", len(unique), len(dups))
    return unique.reset_index(drop=True), dups.reset_index(drop=True)
