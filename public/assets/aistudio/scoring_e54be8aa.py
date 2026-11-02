"""Module 3: lead scoring (0-100) and Hot/Warm/Cold grading."""
import config


def _tier(value, tiers):
    for threshold, points in tiers:
        if value >= threshold:
            return points
    return 0


def score_lead(row):
    source = config.SOURCE_POINTS[row["source"]]
    budget = _tier(row["budget"], config.BUDGET_TIERS)
    size = _tier(row["company_size"], config.SIZE_TIERS)
    engagement = min(config.ENGAGEMENT_MAX, row["website_visits"] * 2 + row["emails_opened"])
    timeline = config.TIMELINE_POINTS[row["timeline"]]
    return int(source + budget + size + engagement + timeline)


def grade_from_score(score):
    if score >= config.HOT_MIN:
        return "Hot"
    return "Warm" if score >= config.WARM_MIN else "Cold"


def add_scores(df):
    df = df.copy()
    if df.empty:
        df["lead_score"], df["grade"] = [], []
        return df
    df["lead_score"] = df.apply(score_lead, axis=1)
    df["grade"] = df["lead_score"].map(grade_from_score)
    return df
