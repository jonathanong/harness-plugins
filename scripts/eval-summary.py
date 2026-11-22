#!/usr/bin/env python3
"""Prints a results file from `pnpm run evals` as the Markdown rows used in evals/EVALS.md.

Usage: scripts/eval-summary.py [evals/results/latest.json]
"""
import json
import sys

path = sys.argv[1] if len(sys.argv) > 1 else "evals/results/latest.json"
data = json.load(open(path))
cases = sorted(data["cases"], key=lambda case: case["dir"])
baseline = any("without" in case["arms"] for case in cases)
attempts = sum(len(runs) for case in cases for runs in case["arms"].values())

print(f"Started {data['startedAt']}, Claude Code {data['claudeVersion']}, ", end="")
print(f"{len(cases)} cases, {attempts} attempts, ${data['costUsd']:.2f}.\n")
print("| Case | Score | Passed | Loaded |" + (" Without plugin |" if baseline else ""))
print("| --- | --- | --- | --- |" + (" --- |" if baseline else ""))
for case in cases:
    runs = case["arms"]["with"]
    # A two-arm run leaves skill-fired out of its own score, so count every grader here.
    passed = sum(1 for run in runs if all(grader["passed"] for grader in run["graders"]))
    shares = [
        sum(1 for grader in run["graders"] if grader["passed"]) / len(run["graders"])
        for run in runs
    ]
    row = f"| `{case['dir'].removeprefix('evals/')}` | {sum(shares) / len(shares):.2f} "
    row += f"| {passed} of {len(runs)} |"
    fired = [
        grader["passed"] for run in runs for grader in run["graders"] if grader["name"] == "skill-fired"
    ]
    row += f" {sum(fired)} of {len(runs)} |" if fired else " n/a |"
    if baseline:
        without = case["arms"].get("without") or []
        score = case["aggregates"].get("scoreWithout")
        row += f" {score:.2f} |" if without and score is not None else " n/a |"
    print(row)

for case in cases:
    for index, run in enumerate(case["arms"]["with"]):
        failed = [grader["name"] for grader in run["graders"] if not grader["passed"]]
        if failed or run["error"]:
            print(f"\nFAILED {case['dir']} attempt {index + 1}: {failed} {run['error'] or ''}")
            print(f"  {run['tracePath']}")
