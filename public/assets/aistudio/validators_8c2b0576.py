"""Module 1: input validation and cleaning."""
import logging
import re

import pandas as pd

import config

log = logging.getLogger(__name__)
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$")


def clean_phone(value):
    """Return a 10-digit Indian mobile number or None if invalid."""
    if value is None or pd.isna(value):
        return None
    digits = re.sub(r"\D", "", str(value))
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    return digits if re.fullmatch(r"[6-9]\d{9}", digits) else None


def _blank(v):
    return v is None or pd.isna(v) or str(v).strip() == ""


def _num(v, default):
    if _blank(v):
        return default, True
    n = pd.to_numeric(v, errors="coerce")
    return (default, False) if pd.isna(n) else (float(n), True)


def validate_row(rec):
    """Return (clean_record, None) or (None, reason_string)."""
    reasons = [f"Missing {c}" for c in config.REQUIRED_COLUMNS if _blank(rec.get(c))]
    if reasons:
        return None, "; ".join(reasons)

    out = {"lead_id": str(rec["lead_id"]).strip(), "name": str(rec["name"]).strip()}
    email = str(rec["email"]).strip().lower()
    if not EMAIL_RE.match(email):
        reasons.append("Invalid email")
    out["email"] = email

    phone = clean_phone(rec["phone"])
    if phone is None:
        reasons.append("Invalid phone")
    out["phone"] = phone

    source = str(rec["source"]).strip().title()
    if source not in config.SOURCE_POINTS:
        reasons.append(f"Unknown source '{rec['source']}'")
    out["source"] = source

    region = str(rec["region"]).strip().title()
    if region not in config.REGIONS:
        reasons.append(f"Unknown region '{rec['region']}'")
    out["region"] = region

    created = pd.to_datetime(rec["created_date"], errors="coerce")
    if pd.isna(created):
        reasons.append("Invalid created_date")
    out["created_date"] = created

    d = config.OPTIONAL_DEFAULTS
    out["company"] = d["company"] if _blank(rec.get("company")) else str(rec["company"]).strip()
    out["industry"] = d["industry"] if _blank(rec.get("industry")) else str(rec["industry"]).strip()

    status = d["status"] if _blank(rec.get("status")) else str(rec["status"]).strip().title()
    if status not in config.VALID_STATUSES:
        reasons.append(f"Unknown status '{rec['status']}'")
    out["status"] = status

    timeline = d["timeline"] if _blank(rec.get("timeline")) else str(rec["timeline"]).strip()
    if timeline not in config.TIMELINE_POINTS:
        reasons.append(f"Unknown timeline '{rec['timeline']}'")
    out["timeline"] = timeline

    for col in ("budget", "company_size", "website_visits", "emails_opened"):
        val, ok = _num(rec.get(col), d[col])
        if not ok or val < 0:
            reasons.append(f"Invalid {col}")
        out[col] = val

    return (None, "; ".join(reasons)) if reasons else (out, None)


def validate_leads(df):
    """Split raw leads into (valid_df, rejected_df). Raises ValueError if required columns are absent."""
    missing = [c for c in config.REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Input file is missing required columns: {missing}")
    valid, rejected = [], []
    for rec in df.to_dict("records"):
        clean, reason = validate_row(rec)
        if clean is None:
            rejected.append({**rec, "reject_reason": reason})
            log.warning("Rejected %s: %s", rec.get("lead_id"), reason)
        else:
            valid.append(clean)
    log.info("Validation: %d valid, %d rejected", len(valid), len(rejected))
    return pd.DataFrame(valid), pd.DataFrame(rejected)
