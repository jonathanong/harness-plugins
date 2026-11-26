#!/usr/bin/env python3
"""Records a results file from `pnpm run evals` in evals/cases.csv, and prints its failed attempts.

Usage: scripts/eval-summary.py [evals/results/latest.json]

An attempt passes when every grader but `skill-fired` passed; `loaded` counts the attempts where
`skill-fired` passed, and `loaded_passed` the passes among those. It replaces only the rows of the cases the run covered, keeping each row's `checks`; a new case
takes its `checks` from the prompt's description. A run with no without-plugin arm keeps the row's
earlier without-plugin result. Run scripts/eval-docs.py afterwards to rebuild the tables.
"""
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("eval_docs", Path(__file__).parent / "eval-docs.py")
docs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(docs)


def loaded(run):
    """Whether the skill loaded: the case's `skill-fired` grader passed."""
    return any(g["name"] == "skill-fired" and g["passed"] for g in run["graders"])


def passed(run):
    """Whether the answer passed: every grader but `skill-fired`, which is the loading layer and
    is counted apart. A run that errored before grading has no graders and counts as failed."""
    graders = [g for g in run["graders"] if g["name"] != "skill-fired"]
    return run["error"] is None and bool(graders) and all(g["passed"] for g in graders)


def share(run):
    graders = run["graders"]
    return sum(1 for grader in graders if grader["passed"]) / len(graders) if graders else 0.0


def money(value):
    return f"{value:.4f}"


path = sys.argv[1] if len(sys.argv) > 1 else "evals/results/latest.json"
data = json.load(open(path))
commit = subprocess.run(
    ["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, check=True
).stdout.strip()
rows = docs.read_rows()
cases = sorted(data["cases"], key=lambda case: case["dir"])
for case in cases:
    name = case["dir"].removeprefix("evals/")
    row = rows.get(name) or dict.fromkeys(docs.COLUMNS, "") | {
        "case": name,
        "checks": docs.description(name),
    }
    runs = case["arms"]["with"]
    without = case["arms"].get("without") or []
    every = runs + without
    graded = any(g["name"] == "skill-fired" for run in runs for g in run["graders"])
    fired = [run for run in runs if loaded(run)]
    total = sum(run["costUsd"] or 0 for run in every)
    judge = sum(run.get("judgeCostUsd") or 0 for run in every)
    row |= {
        "attempts_planned": str(case["runsPerCase"]),
        "run_date": data["startedAt"][:10],
        "commit": commit,
        "agent_model": data["suite"].get("modelOverride") or "",
        "judge_model": data["suite"].get("judgeModel") or "",
        "harness_version": data["claudeVersion"],
        "with_passed": str(sum(map(passed, runs))),
        "with_attempts": str(len(runs)),
        "with_score": f"{sum(map(share, runs)) / len(runs):.2f}" if runs else "",
        "loaded": str(len(fired)) if graded else "",
        "loaded_passed": str(sum(map(passed, fired))) if graded else "",
        "cost_total": money(total),
        "cost_agent": money(total - judge),
        "cost_judge": money(judge),
    }
    if without:
        score = case["aggregates"].get("scoreWithout")
        row |= {
            "without_passed": str(sum(map(passed, without))),
            "without_attempts": str(len(without)),
            "without_score": f"{score:.2f}" if score is not None else "",
        }
    rows[name] = row
docs.write_rows(rows)

attempts = sum(len(runs) for case in cases for runs in case["arms"].values())
print(f"Started {data['startedAt']}, Claude Code {data['claudeVersion']}, ", end="")
print(f"{len(cases)} cases, {attempts} attempts, ${data['costUsd']:.2f}.")
print(f"Updated {len(cases)} rows in {docs.CSV}; run scripts/eval-docs.py to rebuild the tables.")
for case in cases:
    for index, run in enumerate(case["arms"]["with"]):
        failed = [grader["name"] for grader in run["graders"] if not grader["passed"]]
        if failed or run["error"]:
            kind = "NOT LOADED" if failed == ["skill-fired"] else "FAILED"
            print(f"\n{kind} {case['dir']} attempt {index + 1}: {failed} {run['error'] or ''}")
            print(f"  {run['tracePath']}")
