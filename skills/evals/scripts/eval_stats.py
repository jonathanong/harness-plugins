#!/usr/bin/env -S python3 -I
"""Intervals, targets, and stopping decisions for eval results, as references/measuring-runs.md
describes them.

Usage: eval_stats.py results.csv [--planned 3] [--seed 0] [--draws 10000]

The CSV has a header and one row per case. Columns: `case`, `passed`, `attempts` (the attempts
that ran), and optionally `priority` (critical, high, medium, low, or required for a case that
must pass every attempt; empty means medium), `planned` (attempts planned for the case), and
`baseline_passed` with `baseline_attempts` for a second arm.

It prints one line per case with its rate, Wilson 95% interval, count, and verdict; then the
suite's mean rate with a bootstrap interval, the cases that met their target, the gap between
arms when the baseline columns are filled, and the cases that still need an attempt.
"""
import argparse, csv, math, random, sys

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


def verdict(passed, run, planned, target):
    """met, missed, or undecided: whether the attempts left can still change the result."""
    need = needed(target, planned)
    if passed >= need:
        return "met"
    if passed + planned - run < need:
        return "missed"
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


def describe(passed, run, planned, target):
    """One case's result as text. A case that stopped early gets its count and verdict with no
    interval, because the interval assumes the number of attempts was fixed before the run."""
    result = verdict(passed, run, planned, target)
    count = f"{passed} of {run}"
    if run < planned:
        return f"{count}, {result}" + (", stopped early" if result != "undecided" else "")
    low, high = wilson(passed, run)
    return f"{100 * passed / run:.0f} [{low:.0f}-{high:.0f}], {count}, {result}"


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("csv")
    parser.add_argument("--planned", type=int, default=3)
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument("--draws", type=int, default=10000)
    args = parser.parse_args(argv)

    with open(args.csv, newline="") as handle:
        rows = list(csv.DictReader(handle))
    cases, pairs, met, undecided = [], [], 0, []
    for row in rows:
        passed, run = int(row["passed"]), int(row["attempts"])
        planned = int(row.get("planned") or args.planned)
        target = TARGETS[row.get("priority") or "medium"]
        if run == 0:
            print(f"{row['case']}: not run")
            undecided.append(row["case"])
            continue
        print(f"{row['case']}: {describe(passed, run, planned, target)}")
        result = verdict(passed, run, planned, target)
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
