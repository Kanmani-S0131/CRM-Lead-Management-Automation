"""CLI entry point:  python main.py [--input FILE] [--output DIR] [--as-of YYYY-MM-DD]"""
import argparse
import logging
import sys

import config
from pipeline import run_pipeline, setup_logging


def main():
    p = argparse.ArgumentParser(description="DIT-P06 CRM Lead Management Automation")
    p.add_argument("--input", default=str(config.DEFAULT_INPUT))
    p.add_argument("--output", default=str(config.DEFAULT_OUTPUT_DIR))
    p.add_argument("--as-of", default=None, help="Reference date for SLA checks (default: today)")
    a = p.parse_args()
    setup_logging()
    try:
        *_, stats = run_pipeline(a.input, a.output, a.as_of)
    except FileNotFoundError:
        logging.getLogger("main").error("Input file not found: %s", a.input)
        return 1
    except ValueError as exc:
        logging.getLogger("main").error("Bad input: %s", exc)
        return 2
    print("\nDone:", stats)
    return 0


if __name__ == "__main__":
    sys.exit(main())
