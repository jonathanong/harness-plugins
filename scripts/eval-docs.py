#!/usr/bin/env python3
"""Generates the eval tables from evals/cases.csv, the latest result of every case.

Usage: scripts/eval-docs.py          refresh the CSV and rewrite the generated blocks
       scripts/eval-docs.py --check  fail when the CSV or a block is out of date

Each case's priority comes from the `priority-*` tag in its prompt.md, so the CSV's priority,
target, and verdict are refreshed from the tags on every run. Each block sits between
`<!-- evals:NAME -->` and `<!-- /evals:NAME -->`: `cases` in evals/EVALS.md, `groups` in
evals/README.md, `headline` in evals/README.md and README.md.
"""
import csv
import io
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "skills/evals/scripts"))
from eval_stats import TARGETS, verdict  # noqa: E402

CSV = "evals/cases.csv"
COLUMNS = [
    "case", "skill", "priority", "target", "attempts_planned", "checks",
    "run_date", "commit", "agent_model", "judge_model", "harness_version",
    "with_passed", "with_attempts", "with_score",
    "without_passed", "without_attempts", "without_score",
    "loaded", "loaded_passed", "verdict", "ceiling", "cost_total", "cost_agent", "cost_judge",
]  # fmt: skip
PRIORITY_TAGS = {"priority-critical": "critical", "priority-high": "high", "priority-low": "low"}
PRIORITIES = ["critical", "high", "medium", "low"]
# The share of attempts in which an on-demand skill must load, judged per skill.
LOADING_TARGET = 80


def frontmatter(case):
    path = Path(f"evals/{case}/prompt.md")
    if not path.exists():
        sys.exit(f"::error::{CSV} lists {case} but {path} does not exist")
    text = path.read_text()
    match = re.match(r"---\n(.*?)\n---\n", text, re.S)
    return match[1] if match else ""


def priority(case):
    # The same pattern as scripts/check-evals.sh, so the two never disagree on a case's tags.
    found = re.findall(r"priority-[A-Za-z0-9_-]+", frontmatter(case))
    if len(found) > 1 or any(tag not in PRIORITY_TAGS for tag in found):
        sys.exit(f"::error::evals/{case}/prompt.md has priority tags {found}; use at most one of "
                 f"{', '.join(PRIORITY_TAGS)}")  # fmt: skip
    return PRIORITY_TAGS[found[0]] if found else "medium"


def description(case):
    match = re.search(r"^description:[ \t]*(.*)$", frontmatter(case), re.M)
    return match[1].strip() if match else ""


def derive(row):
    """Fills the columns that follow from the tags and the counts."""
    row["skill"] = row["case"].split("/")[0]
    row["priority"] = priority(row["case"])
    row["target"] = str(TARGETS[row["priority"]])
    row["attempts_planned"] = row["attempts_planned"] or "3"
    result = ""
    if row["with_attempts"]:
        result = verdict(int(row["with_passed"]), int(row["with_attempts"]),
                         int(row["attempts_planned"]), int(row["target"]))  # fmt: skip
    row["verdict"] = "" if result == "undecided" else result
    row["ceiling"] = "" if not row["without_score"] else "yes" if float(row["without_score"]) == 1 else "no"
    return row


def read_rows():
    with open(CSV, newline="") as handle:
        return {row["case"]: dict.fromkeys(COLUMNS, "") | row for row in csv.DictReader(handle)}


def render_csv(rows):
    out = io.StringIO()
    writer = csv.DictWriter(out, COLUMNS, lineterminator="\n")
    writer.writeheader()
    writer.writerows(derive(rows[case]) for case in sorted(rows))
    return out.getvalue()


def write_rows(rows):
    text = render_csv(rows)
    if Path(CSV).read_text() != text:
        Path(CSV).write_text(text)


def mean(values):
    return f"{sum(values) / len(values):.2f}" if values else "n/a"


def met(group):
    return f"{sum(1 for row in group if row['verdict'] == 'met')} of {len(group)}"


def layers(row):
    """The loading cells of a case: (loaded, passed when loaded). A row with no loading count is
    a case with no `skill-fired` grader, or one measured before the count was recorded."""
    if not row["loaded"]:
        return "n/a", "n/a"
    loaded = f"{row['loaded']} of {row['with_attempts']}"
    if row["loaded"] == "0":
        return loaded, "not measured"
    return loaded, f"{row['loaded_passed']} of {row['loaded']}"


def graded_for_loading(row):
    return (Path("evals") / row["case"] / "graders" / "skill-fired.md").exists()


def loading(group):
    """A skill's loading: (loaded, attempts, reaches LOADING_TARGET, cases counted, cases that
    have a `skill-fired` grader). Only a row that ran every planned attempt is counted, since a
    run that stopped early is not a rate. None when no case of the skill is counted."""
    gradable = [row for row in group if graded_for_loading(row)]
    counted = [
        row
        for row in gradable
        if row["loaded"] and int(row["with_attempts"]) >= int(row["attempts_planned"])
    ]
    if not counted:
        return None
    loaded = sum(int(row["loaded"]) for row in counted)
    attempts = sum(int(row["with_attempts"]) for row in counted)
    return loaded, attempts, loaded * 100 >= LOADING_TARGET * attempts, len(counted), len(gradable)


def loading_cell(rate):
    if rate is None:
        return "n/a"
    loaded, attempts, reached, counted, gradable = rate
    cell = f"{loaded} of {attempts}"
    if counted < gradable:
        cell += f", from {counted} of {gradable} cases"
    return cell if reached else f"{cell}, under {LOADING_TARGET}%"


def cases_table(rows):
    table = [
        "| Case | Checks that the agent | Priority | Score | Loaded | Passed when loaded "
        "| Passed | Without plugin | Verdict |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for row in rows:
        if row["with_attempts"]:
            score, passed = row["with_score"], f"{row['with_passed']} of {row['with_attempts']}"
            loaded, when_loaded = layers(row)
            without = row["without_score"] or "n/a"
            result = row["verdict"] or "undecided"
        else:
            score = loaded = when_loaded = passed = without = result = "not run"
        table.append(f"| `{row['case']}` | {row['checks']} | {row['priority']} | {score} "
                     f"| {loaded} | {when_loaded} | {passed} | {without} | {result} |")  # fmt: skip
    return "\n".join(table)


def blocks(all_rows):
    rows = [row for row in all_rows if row["with_attempts"]]
    skills = defaultdict(list)
    for row in rows:
        skills[row["skill"]].append(row)
    score = lambda row: float(row["with_score"])  # noqa: E731
    baseline = lambda row: float(row["without_score"])  # noqa: E731
    both = [row for row in rows if row["without_score"]]
    unaided = [row for row in both if baseline(row) == 1.0]
    guards = [row for row in unaided if row["checks"].startswith("Guard:")]
    by_priority = [
        f"{name} {met(group)}"
        for name in PRIORITIES
        if (group := [row for row in rows if row["priority"] == name])
    ]
    rates = {skill: rate for skill, group in skills.items() if (rate := loading(group))}
    low = sorted(skill for skill, rate in rates.items() if not rate[2])
    full = {skill for skill, rate in rates.items() if rate[3] == rate[4]}
    headline = "\n".join(
        [
            f"- **{len(rows)} cases** across {len(skills)} skills.",
            f"- **With the plugin:** mean score {mean([score(row) for row in both])}.",
            f"- **Without it:** mean score {mean([baseline(row) for row in both])},"
            f" over the {len(both)} cases measured both ways.",
            f"- **{len(both) - len(unaided)} cases** are ones the model fails unaided."
            f" The other {len(unaided)} it already gets right: {len(guards)} check that a skill"
            f" stays out of the way, and {len(unaided) - len(guards)} show at most that the skill"
            " loads.",
            f"- **{met(rows)} cases** meet their target: {', '.join(by_priority)}. "
            "The rows come from different runs, and a row with fewer attempts than planned stopped "
            "early: read it as a verdict, not a rate.",
            f"- **Loading** is counted for every case of {len(full)} of {len(skills)} skills, and "
            f"{len(full) - len([skill for skill in low if skill in full])} of those load in at "
            f"least {LOADING_TARGET}% of attempts. For {len(rates) - len(full)} more it is counted "
            "for some cases only, which does not show the skill meets the target."
            + (f" Under it on what was counted: {', '.join(f'`{skill}`' for skill in low)}." if low else ""),
        ]
    )
    table = [
        "| Skill | Cases | With plugin | Without plugin | Already right unaided | Loaded "
        "| Met target |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for skill in sorted(skills):
        group = skills[skill]
        measured = [row for row in group if row["without_score"]]
        rate = rates.get(skill)
        loaded = loading_cell(rate)
        table.append(
            f"| `{skill}` | {len(group)} | {mean([score(row) for row in group])} "
            f"| {mean([baseline(row) for row in measured])} "
            f"| {sum(1 for row in measured if baseline(row) == 1.0)} | {loaded} | {met(group)} |"
        )
    return {"cases": cases_table(all_rows), "headline": headline, "groups": "\n".join(table)}


def squash(text):
    # The formatter pads table cells and rewraps lines, so compare without spacing.
    return re.sub(r"[\s-]+", " ", text).strip()


def main():
    check = "--check" in sys.argv
    stale = []
    rows = read_rows()
    text = render_csv(rows)
    if Path(CSV).read_text() != text:
        stale.append(CSV)
        if not check:
            Path(CSV).write_text(text)
    generated = blocks([rows[case] for case in sorted(rows)])
    for path in ("evals/EVALS.md", "evals/README.md", "README.md"):
        text = open(path).read()
        new = text
        for name, body in generated.items():
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


if __name__ == "__main__":
    main()
