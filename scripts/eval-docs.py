#!/usr/bin/env python3
"""Rolls evals/EVALS.md up into the per-skill table and headline shown to people.

Usage: scripts/eval-docs.py          rewrite the generated blocks
       scripts/eval-docs.py --check  fail when a block is out of date

Each block sits between `<!-- evals:NAME -->` and `<!-- /evals:NAME -->`: `groups` in
evals/README.md, `headline` in evals/README.md and README.md.
"""
import re
import sys
from collections import defaultdict

ROW = re.compile(r"^\| `([\w-]+)/([\w-]+)` +\|(.*)\|$")


def cases():
    for line in open("evals/EVALS.md"):
        match = ROW.match(line)
        if match:
            checks, score, _passed, without = (cell.strip() for cell in match[3].split("|"))
            if score == "not run":
                continue
            baseline = None if without == "n/a" else float(without)
            yield match[1], float(score), baseline, checks.startswith("Guard:")


def mean(values):
    return f"{sum(values) / len(values):.2f}" if values else "n/a"


def blocks():
    rows = list(cases())
    skills = defaultdict(list)
    for row in rows:
        skills[row[0]].append(row)
    both = [row for row in rows if row[2] is not None]
    unaided = [row for row in both if row[2] == 1.0]
    guards = [row for row in unaided if row[3]]
    headline = "\n".join(
        [
            f"- **{len(rows)} cases** across {len(skills)} skills.",
            f"- **With the plugin:** mean score {mean([row[1] for row in both])}.",
            f"- **Without it:** mean score {mean([row[2] for row in both])},"
            f" over the {len(both)} cases measured both ways.",
            f"- **{len(both) - len(unaided)} cases** are ones the model fails unaided."
            f" The other {len(unaided)} it already gets right: {len(guards)} check that a skill"
            f" stays out of the way, and {len(unaided) - len(guards)} show at most that the skill"
            " loads.",
        ]
    )
    table = [
        "| Skill | Cases | With plugin | Without plugin | Already right unaided |",
        "| --- | --- | --- | --- | --- |",
    ]
    for skill in sorted(skills):
        group = skills[skill]
        measured = [row for row in group if row[2] is not None]
        table.append(
            f"| `{skill}` | {len(group)} | {mean([row[1] for row in group])} "
            f"| {mean([row[2] for row in measured])} "
            f"| {sum(1 for row in measured if row[2] == 1.0)} |"
        )
    return {"headline": headline, "groups": "\n".join(table)}


def squash(text):
    # The formatter pads table cells and rewraps lines, so compare without spacing.
    return re.sub(r"[\s-]+", " ", text).strip()


def main():
    check = "--check" in sys.argv
    stale = []
    for path in ("evals/README.md", "README.md"):
        text = open(path).read()
        new = text
        for name, body in blocks().items():
            pattern = re.compile(rf"(<!-- evals:{name} -->\n)(.*?)(<!-- /evals:{name} -->)", re.S)
            new = pattern.sub(
                lambda m: m[0] if squash(m[2]) == squash(body) else f"{m[1]}\n{body}\n\n{m[3]}", new
            )
        if new != text:
            stale.append(path)
            if not check:
                open(path, "w").write(new)
    if check and stale:
        print(f"::error::{', '.join(stale)} out of date; run scripts/eval-docs.py", file=sys.stderr)
        sys.exit(1)


main()
