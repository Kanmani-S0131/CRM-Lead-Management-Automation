"""Orchestrates the end-to-end pipeline."""
import logging

import pandas as pd

import config
from assignment import add_assignments
from dedupe import remove_duplicates
from followup import add_followup
from reports import write_outputs
from scoring import add_scores
from validators import validate_leads


def setup_logging():
    config.LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                        handlers=[logging.FileHandler(config.LOG_FILE, mode="w"), logging.StreamHandler()],
                        force=True)


def run_pipeline(input_path=config.DEFAULT_INPUT, output_dir=config.DEFAULT_OUTPUT_DIR, as_of=None, write=True):
    log = logging.getLogger("pipeline")
    as_of = pd.Timestamp(as_of) if as_of else pd.Timestamp.today().normalize()
    log.info("Reading %s (as_of=%s)", input_path, as_of.date())
    raw = pd.read_csv(input_path, dtype=str)
    valid, rejected = validate_leads(raw)
    unique, dups = remove_duplicates(valid)
    processed = add_followup(add_assignments(add_scores(unique)), as_of)
    if write:
        write_outputs(processed, rejected, dups, output_dir)
    stats = {"input_rows": len(raw), "valid": len(valid), "rejected": len(rejected),
             "duplicates": len(dups), "processed": len(processed)}
    log.info("Summary: %s", stats)
    return processed, rejected, dups, stats
