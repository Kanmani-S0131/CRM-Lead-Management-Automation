"""Central configuration and business rules for DIT-P06 CRM Lead Management Automation."""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = BASE_DIR / "data" / "leads_raw.csv"
DEFAULT_OUTPUT_DIR = BASE_DIR / "output"
LOG_FILE = BASE_DIR / "logs" / "pipeline.log"

REQUIRED_COLUMNS = ["lead_id", "name", "email", "phone", "source", "region", "created_date"]
OPTIONAL_DEFAULTS = {
    "company": "Unknown", "industry": "Unknown", "status": "New", "budget": 0,
    "company_size": 1, "timeline": "6+ Months", "website_visits": 0, "emails_opened": 0,
}

VALID_STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"]
OPEN_STATUSES = ["New", "Contacted", "Qualified"]   # leads still being worked
SLA_STATUSES = ["New"]                               # first-response SLA applies to these
REGIONS = ["North", "South", "East", "West"]

# ---- Scoring rules (max 100) ----
SOURCE_POINTS = {"Referral": 25, "Webinar": 20, "Website": 15, "Trade Show": 15,
                 "Social Media": 8, "Cold Call": 5}                      # max 25
BUDGET_TIERS = [(1_000_000, 25), (500_000, 20), (100_000, 10), (0, 5)]   # INR, max 25
SIZE_TIERS = [(200, 15), (50, 10), (11, 6), (0, 3)]                      # employees, max 15
TIMELINE_POINTS = {"0-1 Months": 20, "1-3 Months": 12, "3-6 Months": 6, "6+ Months": 2}  # max 20
ENGAGEMENT_MAX = 15   # min(15, website_visits*2 + emails_opened)

# ---- Grading & SLA ----
HOT_MIN, WARM_MIN = 70, 40            # >=70 Hot, 40-69 Warm, <40 Cold
SLA_DAYS = {"Hot": 1, "Warm": 3, "Cold": 7}

# ---- Sales team (synthetic) ----
REPS = {
    "North": [{"name": "Arjun Rao", "level": "Senior"}, {"name": "Meena Iyer", "level": "Junior"}, {"name": "Karan Singh", "level": "Junior"}],
    "South": [{"name": "Lakshmi Nair", "level": "Senior"}, {"name": "Vikram Raj", "level": "Junior"}, {"name": "Divya S", "level": "Junior"}],
    "East":  [{"name": "Sourav Das", "level": "Senior"}, {"name": "Priya Roy", "level": "Junior"}, {"name": "Ankit Ghosh", "level": "Junior"}],
    "West":  [{"name": "Rohan Mehta", "level": "Senior"}, {"name": "Neha Patil", "level": "Junior"}, {"name": "Sameer Shah", "level": "Junior"}],
}
