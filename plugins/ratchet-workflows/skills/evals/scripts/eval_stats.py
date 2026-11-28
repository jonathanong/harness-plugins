#!/usr/bin/env -S python3 -I
"""Intervals, targets, and stopping decisions for eval results, as references/measuring-runs.md
and references/workflow-evals.md describe them.

Usage: eval_stats.py results.csv [--planned 3] [--seed 0] [--draws 10000]
                                 [--combine noisy-or|weighted] [--no-stage-floors]

Single-stage CSV: `case`, `passed`, `attempts`, and optionally `priority` (critical, high, medium,
low, or required; empty means medium), `target` (overrides priority default), `ci_low_target`,
`planned`, and `baseline_passed` with `baseline_attempts`.

Workflow CSV (detected by a `stage` column): `case`, `stage`, `passed`, `attempts`, and optionally
`effectiveness` (for `--combine noisy-or`, in (0, 1], default 1) or `weight` (for `--combine
weighted`, > 0, default 1), `planned`, `stage_priority`, `stage_target`, `case_priority`,
`case_target`, and `case_ci_low_target`.
"""
import argparse, csv, math, random, sys
from collections import defaultdict
from fractions import Fraction

sys.dont_write_bytecode = True

# "required" is a case that must pass every attempt; it is not a priority.
TARGETS = {"required": 100, "critical": 80, "high": 70, "medium": 60, "low": 50}
Z = 1.959963984540054  # two-sided 95%


def needed(target, attempts):
    """Passes a case needs to meet a target given in percent. Whole numbers only: a floating-point
    product can land just above a whole number, so ceil(0.28 * 25) is 8, not 7."""
    return -(-target * attempts // 100)


def wilson(passed, attempts):
    """The Wilson score 95% interval of passed over attempts, as two percentages."""
    rate = passed / attempts
    denominator = 1 + Z * Z / attempts
    centre = (rate + Z * Z / (2 * attempts)) / denominator
    half = Z * math.sqrt(rate * (1 - rate) / attempts + Z * Z / (4 * attempts**2)) / denominator
    return max(0.0, 100 * (centre - half)), min(100.0, 100 * (centre + half))


def verdict(passed, run, planned, target, ci_low_target=None):
    """met, missed, or undecided: whether the attempts left can still change the result."""
    need = needed(target, planned)
    best = passed + planned - run
    if best < need:
        return "missed"
    if ci_low_target is not None:
        if wilson(best, planned)[0] < ci_low_target:
            return "missed"
        if passed >= need and wilson(passed, planned)[0] >= ci_low_target:
            return "met"
        return "undecided"
    if passed >= need:
        return "met"
    return "undecided"


def _percentiles(values):
    values.sort()
    return values[int(0.025 * len(values))], values[int(0.975 * len(values)) - 1]


def _rate(rng, passed, attempts):
    # A rate drawn from the case's own attempts is always 100 for an all-pass case, which gives
    # a suite of such cases a zero-width interval. The Beta draw keeps the per-case uncertainty.
    return rng.betavariate(passed + 0.5, attempts - passed + 0.5)


def suite_interval(cases, seed=0, draws=10000):
    """Mean pass rate over (passed, attempts) cases, with a 95% bootstrap interval over cases.
    Returns three percentages: mean, low, high."""
    rng = random.Random(seed)
    means = [
        sum(_rate(rng, *rng.choice(cases)) for _ in cases) / len(cases) for _ in range(draws)
    ]
    low, high = _percentiles(means)
    mean = sum(passed / attempts for passed, attempts in cases) / len(cases)
    return 100 * mean, 100 * low, 100 * high


def gap_interval(pairs, seed=0, draws=10000):
    """Mean gap between two arms over ((passed, attempts), (passed, attempts)) cases, the arm
    under test first, with a 95% bootstrap interval that draws both arms of a case together.
    Returns three percentage-point values: gap, low, high."""
    rng = random.Random(seed)
    gaps = []
    for _ in range(draws):
        total = 0.0
        for _ in pairs:
            test, baseline = rng.choice(pairs)
            total += _rate(rng, *test) - _rate(rng, *baseline)
        gaps.append(total / len(pairs))
    low, high = _percentiles(gaps)
    gap = sum(a / n - b / m for (a, n), (b, m) in pairs) / len(pairs)
    return 100 * gap, 100 * low, 100 * high


def _combine_exact(rates, params, combine):
    if combine == "weighted":
        return sum(w * r for r, w in zip(rates, params)) / sum(params)
    return 1 - math.prod(1 - e * r for r, e in zip(rates, params))


def _combine_float(rates, params, combine):
    if combine == "weighted":
        return sum(w * r for r, w in zip(rates, params)) / sum(params)
    return 1.0 - math.prod(1.0 - e * r for r, e in zip(rates, params))


def workflow_score(stages, combine="noisy-or"):
    """Exact combined score over (passed, attempts, param) stages as a Fraction.
    `combine="noisy-or"` uses 1 - prod(1 - e_i * p_i) for sequential gates;
    `combine="weighted"` uses sum(w_i * p_i) / sum(w_i) for independent dimensions."""
    params = [Fraction(str(param)) for _, _, param in stages]
    rates = [Fraction(passed, attempts) for passed, attempts, _ in stages]
    return _combine_exact(rates, params, combine)


def workflow_interval(stages, combine="noisy-or", seed=0, draws=10000):
    """Combined score over (passed, attempts, param) stages with a 95% credible interval from
    Beta(passed + 0.5, failed + 0.5) draws per stage. Returns mean, low, high."""
    params = [float(param) for _, _, param in stages]
    rng = random.Random(seed)
    samples = [
        _combine_float([_rate(rng, passed, attempts) for passed, attempts, _ in stages], params, combine)
        for _ in range(draws)
    ]
    low, high = _percentiles(samples)
    return 100 * float(workflow_score(stages, combine)), 100 * low, 100 * high


def workflow_verdict(
    stages,
    case_target,
    combine="noisy-or",
    enforce_floors=True,
    ci_low_target=None,
    seed=0,
    draws=10000,
):
    """Verdict for one multi-stage workflow case over (passed, run, planned, param, stage_target)
    tuples. Returns met, missed, or undecided."""
    stage_verdicts = [verdict(p, r, pl, st) for p, r, pl, _, st in stages]
    if enforce_floors and "missed" in stage_verdicts:
        return "missed"
    params = [Fraction(str(param)) for _, _, _, param, _ in stages]
    max_score = _combine_exact([Fraction(p + pl - r, pl) for p, r, pl, _, _ in stages], params, combine)
    min_score = _combine_exact([Fraction(p, pl) for p, _, pl, _, _ in stages], params, combine)
    target = Fraction(str(case_target)) / 100
    if max_score < target:
        return "missed"
    if any(r < pl for _, r, pl, _, _ in stages):
        if ci_low_target is None and min_score >= target and (
            not enforce_floors or all(v == "met" for v in stage_verdicts)
        ):
            return "met"
        return "undecided"
    if ci_low_target is not None:
        _, low, _ = workflow_interval(
            [(p, r, param) for p, r, _, param, _ in stages], combine, seed=seed, draws=draws
        )
        if low < ci_low_target:
            return "missed"
    return "met"


def describe(passed, run, planned, target, ci_low_target=None):
    """One case's result as text. A case that stopped early gets its count and verdict with no
    interval, because the interval assumes the number of attempts was fixed before the run."""
    result = verdict(passed, run, planned, target, ci_low_target)
    count = f"{passed} of {run}"
    if run < planned:
        return f"{count}, {result}" + (", stopped early" if result != "undecided" else "")
    low, high = wilson(passed, run)
    return f"{100 * passed / run:.0f} [{low:.0f}-{high:.0f}], {count}, {result}"


def _target(row, target_col, priority_col):
    if row.get(target_col):
        return int(row[target_col])
    return TARGETS[row.get(priority_col) or "medium"]


def _run_workflow(rows, args):
    grouped = defaultdict(list)
    for row in rows:
        grouped[row["case"]].append(row)
    label = "w" if args.combine == "weighted" else "e"
    param_col = "weight" if args.combine == "weighted" else "effectiveness"
    met, undecided = 0, []
    for case, stage_rows in grouped.items():
        first = stage_rows[0]
        case_target = _target(first, "case_target", "case_priority")
        ci_low = float(first["case_ci_low_target"]) if first.get("case_ci_low_target") else None
        stages = []
        for row in stage_rows:
            passed, run = int(row["passed"]), int(row["attempts"])
            planned = int(row.get("planned") or args.planned)
            param = row.get(param_col) or "1"
            stage_target = _target(row, "stage_target", "stage_priority")
            stages.append((passed, run, planned, param, stage_target))
        result = workflow_verdict(
            stages, case_target, args.combine, not args.no_stage_floors, ci_low, args.seed, args.draws
        )
        met += result == "met"
        if result == "undecided":
            undecided.append(case)
        if all(r == pl for _, r, pl, _, _ in stages):
            mean, low, high = workflow_interval(
                [(p, r, param) for p, r, _, param, _ in stages], args.combine, args.seed, args.draws
            )
            print(f"{case}: {mean:.0f} [{low:.0f}-{high:.0f}], {result}")
        else:
            print(f"{case}: {result}")
        for row, (passed, run, planned, param, stage_target) in zip(stage_rows, stages):
            detail = "not run" if run == 0 else describe(passed, run, planned, stage_target)
            print(f"  {row['stage']} ({label}={param}): {detail}")
    print(f"workflow: {met} of {len(grouped)} cases met their target")
    if undecided:
        print("undecided: " + " ".join(undecided))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("csv")
    parser.add_argument("--planned", type=int, default=3)
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument("--draws", type=int, default=10000)
    parser.add_argument("--combine", choices=("noisy-or", "weighted"), default="noisy-or")
    parser.add_argument("--no-stage-floors", action="store_true")
    args = parser.parse_args(argv)

    with open(args.csv, newline="") as handle:
        reader = csv.DictReader(handle)
        fields = reader.fieldnames or []
        rows = list(reader)
    if "stage" in fields:
        _run_workflow(rows, args)
        return
    cases, pairs, met, undecided = [], [], 0, []
    for row in rows:
        passed, run = int(row["passed"]), int(row["attempts"])
        planned = int(row.get("planned") or args.planned)
        target = _target(row, "target", "priority")
        ci_low = float(row["ci_low_target"]) if row.get("ci_low_target") else None
        if run == 0:
            print(f"{row['case']}: not run")
            undecided.append(row["case"])
            continue
        print(f"{row['case']}: {describe(passed, run, planned, target, ci_low)}")
        result = verdict(passed, run, planned, target, ci_low)
        met += result == "met"
        if result == "undecided":
            undecided.append(row["case"])
        cases.append((passed, run))
        if row.get("baseline_attempts"):
            pairs.append(((passed, run), (int(row["baseline_passed"]), int(row["baseline_attempts"]))))
    if cases:
        mean, low, high = suite_interval(cases, args.seed, args.draws)
        print(f"suite: {mean:.0f} [{low:.0f}-{high:.0f}], {met} of {len(rows)} cases met their target")
    if pairs:
        gap, low, high = gap_interval(pairs, args.seed, args.draws)
        shown = "" if low > 0 or high < 0 else ", does not show a difference"
        print(f"gap: {gap:+.0f} [{low:+.0f} to {high:+.0f}] over {len(pairs)} cases{shown}")
    if undecided:
        print("undecided: " + " ".join(undecided))


if __name__ == "__main__":
    main()
