#!/usr/bin/env python3
"""Runs the eval suite in rounds of one attempt and stops each case once the attempts left cannot
change its verdict against its priority target, as skills/evals/references/measuring-runs.md
("Stopping early") describes. Writes the merged result to evals/results/latest.json.

Usage: scripts/eval-rounds.py [--dry-run] [skill ...]   (default: every skill)
Reads EVAL_MODEL, EVAL_JUDGE_MODEL, EVAL_CONCURRENCY, EVAL_FLAGS as scripts/run-evals.sh does,
and EVAL_MAX_COST_USD as a cost ceiling for the whole run.
"""
import concurrent.futures
import copy
import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "skills/evals/scripts"))
from eval_stats import TARGETS, verdict  # noqa: E402

RESULTS = "evals/results"
DEFAULT_PLANNED = 3
PRIORITY_TAGS = {"priority-critical": "critical", "priority-high": "high", "priority-low": "low"}
OWNED_FLAGS = {"--runs", "--json", "--ablation", "--case", "--concurrency", "-j", "--max-cost-usd"}


# Decisions: pure functions over parsed results.


def priority(prompt_text):
    """critical, high, medium, or low, from the priority-* tag in a prompt.md frontmatter. Raises
    ValueError for two tags or an unknown one, as scripts/check-evals.sh and scripts/eval-docs.py
    reject them: a mistyped tag must not run the case against the medium target."""
    match = re.match(r"---\n(.*?)\n---\n", prompt_text, re.S)
    found = re.findall(r"priority-[A-Za-z0-9_-]+", match[1] if match else "")
    if len(found) > 1 or any(tag not in PRIORITY_TAGS for tag in found):
        raise ValueError(f"priority tags {found}; use at most one of {', '.join(PRIORITY_TAGS)}")
    return PRIORITY_TAGS[found[0]] if found else "medium"


def skill_of(case):
    """The skill a case belongs to: the parent directory of the case directory."""
    return Path(case["dir"]).parent.name


def attempt_passed(run):
    """An attempt passes when it has no error and every one of its graders passed."""
    graders = run.get("graders") or []
    return run.get("error") is None and bool(graders) and all(g["passed"] for g in graders)


def merge(rounds):
    """One result in the runner's schema from a list of results, round 1 first. Each case keeps
    round 1's fields; its `arms.with` is the concatenation of its runs across rounds."""
    merged = copy.deepcopy(rounds[0])
    by_dir = {case["dir"]: case for case in merged["cases"]}
    for result in rounds[1:]:
        merged["costUsd"] += result.get("costUsd") or 0
        merged["durationSeconds"] = merged.get("durationSeconds", 0) + result.get(
            "durationSeconds", 0
        )
        merged["partial"] = bool(merged.get("partial") or result.get("partial"))
        for case in result["cases"]:
            if case["dir"] in by_dir:
                by_dir[case["dir"]]["arms"]["with"].extend(case["arms"]["with"])
    return merged


def tally(merged, priorities):
    """Per case dir: (passed, run, planned, target, verdict)."""
    out = {}
    for case in merged["cases"]:
        runs = case["arms"]["with"]
        passed = sum(attempt_passed(run) for run in runs)
        planned = case.get("runsPerCase") or DEFAULT_PLANNED
        target = TARGETS[priorities[case["dir"]]]
        out[case["dir"]] = (passed, len(runs), planned, target, verdict(passed, len(runs), planned, target))
    return out


def undecided(merged, priorities):
    """The cases that still need an attempt."""
    counts = tally(merged, priorities)
    return [
        case
        for case in merged["cases"]
        if counts[case["dir"]][4] == "undecided" and counts[case["dir"]][1] < counts[case["dir"]][2]
    ]


def covers(result, case):
    """Whether an invocation for one case wrote a result holding that case."""
    return result is not None and any(c["dir"] == case["dir"] for c in result["cases"])


def split_budget(max_cost, spent, invocations):
    """The --max-cost-usd for each of a round's invocations, or None when there is no ceiling."""
    if max_cost is None:
        return None
    return max(0.0, max_cost - spent) / invocations


def base_command(env):
    """The `claude plugin eval` command scripts/run-evals.sh builds, up to the per-round flags."""
    return [
        "claude", "plugin", "eval", ".",
        "--trust-plugin",
        "--scaffold",
        "--model", env.get("EVAL_MODEL") or "sonnet",
        "--judge-model", env.get("EVAL_JUDGE_MODEL") or "opus",
        "--ablation", "none",
        "--no-publish",
        "--runs", "1",
        *shlex.split(env.get("EVAL_FLAGS") or ""),
    ]  # fmt: skip


def round_command(env, json_path, concurrency, budget, tags, case=None):
    """One invocation of a round. --allow-tools and --tag take lists, so --tag goes last."""
    command = base_command(env) + ["--concurrency", str(concurrency), "--json", json_path]
    if budget is not None:
        command += ["--max-cost-usd", f"{budget:.4f}"]
    if case is not None:
        command += ["--case", case]
    command += ["--allow-tools", "Bash"]
    return command + (["--tag", *tags] if tags else [])


def refusal(env):
    """Why the driver must not run with this environment, or None."""
    if (env.get("EVAL_ABLATION") or "none") == "with-without":
        return (
            "EVAL_ABLATION=with-without: a two-arm run quotes a gap between the arms, so it runs "
            "every attempt. Run scripts/run-evals.sh without EVAL_STOP_EARLY."
        )
    owned = sorted(OWNED_FLAGS & {flag.split("=")[0] for flag in shlex.split(env.get("EVAL_FLAGS") or "")})
    if owned:
        return f"EVAL_FLAGS sets {', '.join(owned)}, which the driver sets itself for each round."
    return None


# Effects: running the runner and reading its files.


def invoke(command, json_path):
    """Runs one invocation and returns its parsed JSON, or None when it wrote none. The runner
    exits 1 when a case scores below its threshold, which is a normal result."""
    path = ROOT / json_path
    path.unlink(missing_ok=True)
    completed = subprocess.run(command, cwd=ROOT)
    if not path.exists():
        print(f"{shlex.join(command)} exited {completed.returncode} and wrote no {json_path}")
        return None
    return json.loads(path.read_text())


def read_priorities(cases):
    priorities = {}
    for case in cases:
        prompt = ROOT / case["dir"] / "prompt.md"
        try:
            priorities[case["dir"]] = priority(prompt.read_text() if prompt.exists() else "")
        except ValueError as error:
            sys.exit(f"{prompt}: {error}")
    return priorities


def finish(rounds, priorities, message=None):
    """Writes the merged result and returns the exit code: 1 when the run stopped short or a case
    missed its target, as `claude plugin eval` exits 1 for a case below its threshold."""
    merged = merge(rounds)
    (ROOT / RESULTS / "latest.json").write_text(json.dumps(merged, indent=2) + "\n")
    counts = tally(merged, priorities) if priorities else {}
    ran = sum(count[1] for count in counts.values())
    full = sum(count[2] for count in counts.values())
    print(f"{ran} attempts run of {full} a full run would use; total cost ${merged['costUsd']:.2f}")
    if message:
        print(message, file=sys.stderr)
        return 1
    missed = sorted(case for case, count in counts.items() if count[4] == "missed")
    if missed:
        print(f"{len(missed)} missed their target: {' '.join(missed)}", file=sys.stderr)
        return 1
    return 0


def main(argv, env):
    dry_run = "--dry-run" in argv
    skills = [arg for arg in argv if arg != "--dry-run"]
    reason = refusal(env)
    if reason:
        print(reason, file=sys.stderr)
        return 2
    max_cost = float(env["EVAL_MAX_COST_USD"]) if env.get("EVAL_MAX_COST_USD") else None
    concurrency = int(env.get("EVAL_CONCURRENCY") or 6)

    first = round_command(env, f"{RESULTS}/round-1.json", concurrency, max_cost, skills)
    if dry_run:
        print(shlex.join(first))
        return 0
    result = invoke(first, f"{RESULTS}/round-1.json")
    if result is None:
        print("Round 1 failed without writing its results.", file=sys.stderr)
        return 1
    rounds = [result]
    priorities = read_priorities(result["cases"])
    number, ran = 1, len(result["cases"])
    while True:
        merged = merge(rounds)
        left = undecided(merged, priorities)
        decided = len(merged["cases"]) - len(left)
        print(f"round {number}: {ran} cases run, {decided} of {len(merged['cases'])} decided")
        if merged.get("partial"):
            return finish(rounds, priorities, f"Round {number} stopped partway (partial: true).")
        if not left:
            return finish(rounds, priorities)
        if max_cost is not None and merged["costUsd"] >= max_cost:
            names = " ".join(case["name"] for case in left)
            return finish(rounds, priorities, f"EVAL_MAX_COST_USD reached; undecided: {names}")

        number, ran = number + 1, len(left)
        budget = split_budget(max_cost, merged["costUsd"], len(left))
        jobs = []
        for case in left:
            path = f"{RESULTS}/round-{number}-{skill_of(case)}-{case['name']}.json"
            jobs.append((round_command(env, path, 1, budget, [skill_of(case)], case["name"]), path))
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as pool:
            results = list(pool.map(lambda job: invoke(*job), jobs))
        rounds += [r for r in results if r is not None]
        failed = [case["name"] for case, r in zip(left, results) if not covers(r, case)]
        if failed:
            return finish(rounds, priorities, f"Round {number} failed for: {' '.join(failed)}")


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:], os.environ))
