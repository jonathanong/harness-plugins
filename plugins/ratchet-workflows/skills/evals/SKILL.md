---
name: evals
description: Use when creating an evals directory, choosing which evals to run, adding or changing an eval case, grader, or fixture, recording or reporting eval results, or reviewing a change that quotes an eval score. Lay out and maintain an eval suite's documents - README.md for current scores and scope, HISTORY.md for the run log, AGENTS.md for the rules.
---

# Eval suite documents

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

An eval score is only useful to someone who knows what was measured, when, and against what. Keep
that in three files beside the cases. Each has one reader and one job.

| File         | Reader           | Holds                                                         |
| ------------ | ---------------- | ------------------------------------------------------------- |
| `README.md`  | A person         | What the suite evaluates and the current scores.              |
| `HISTORY.md` | A person, later  | Every measured run and every change to what is measured.      |
| `AGENTS.md`  | An agent editing | The rules for adding, changing, running, and recording evals. |

Start with one set at `evals/`. Add a nested set at `evals/<group>/` only when that group has its
own scores, run command, or rules that would crowd the top-level files. A nested `AGENTS.md` adds
to the parent's rules. A nested `README.md` owns its group's table, and the parent `README.md`
keeps one summary row per group that links to it. Each score has one source file; any other
file that shows it is generated from that source.

## README.md: the current state, for people

Write it for someone who has not seen the suite and will not read the cases. In this order:

1. **What the suite evaluates.** One paragraph: behavior under test and the question scores answer.
2. **Current results.** One table from one run. Above it, state the run's date, commit, agent
   model, judge model, attempts per arm, and cost, split into agent and judges when the runner
   reports them apart.
3. **What each case checks.** One line per case, or per group when there are many, in plain words.
   A reader should be able to tell what a failing row means without opening the case.
4. **How to read the numbers.** The noise at this sample size, which cases are at the ceiling, and
   any row that came from a different run.
5. **What the suite does not measure.** The claims a reader might wrongly draw.
6. **How to run it.** The exact command, what it costs or needs, and where raw results land.
7. Links to `HISTORY.md` and `AGENTS.md`.

Rules for the results table:

- Report both arms when the suite has a baseline arm (with and without the thing under test). The
  difference between the arms is the result; a high score with no difference means the model does
  as well without it.
- Mark a case whose baseline arm already scores at the top as a ceiling case. It shows that the
  thing under test fires and does no harm, not that it helps.
- Build the table from one run. If a row comes from another run, mark it and name that run.
- Keep older scores, reasons behind a change, and history in `HISTORY.md`, not here.
- Do not round a small sample into a claim. Give the count beside the rate ("2 of 3"), and say
  what difference the sample cannot resolve.

## HISTORY.md: the log

`HISTORY.md` only grows. Newest entry first. Each entry is a dated heading with a short title,
then:

- the commit, agent model, judge model, attempts per arm, and cost, split the same way;
- the scores, or the rows that changed since the previous entry;
- what changed in the suite since the previous entry: cases added or removed, grader or fixture
  edits, model or runner changes;
- what the run showed, in one or two sentences.

Also record, as their own entries:

- **A grader, fixture, or prompt change that can move a score**, even with no run. Say which cases
  are no longer comparable with earlier entries.
- **A retraction.** When an earlier entry turns out wrong, add a new entry that says so and link
  it. Do not edit the old entry beyond a one-line pointer to the correction.
- **A failed or abandoned run** that someone might otherwise repeat, with the cause.

`README.md` is the newest comparable state rolled up from this log. Every number in `README.md`
must be traceable to one `HISTORY.md` entry.

## AGENTS.md: the rules

Keep it short and imperative. It is loaded into an agent's context every time it works in the
directory, so leave out results and history. Cover:

- how to run the suite, one case, and one group, with the models and attempts to use;
- what every case must contain, and how cases are named and laid out;
- how graders must be written (see below);
- what a fixture may and may not do on the machine that runs it;
- which actions a case must never perform for real;
- that changing a case, grader, fixture, or subject updates `README.md` and `HISTORY.md` together;
- anything generated: name the generator, and say not to edit its output.

## Rules worth putting in AGENTS.md

These are defaults. Adopt the ones the suite can enforce. Read `references/eval-types.md` for the
kinds of eval a skill suite runs and the attempts each needs, and
`references/case-and-grader-rules.md` when writing a case, a grader, or the suite's `AGENTS.md`.

**Runs and numbers**

- Set each case's priority from effort and impact (each suite defines its mapping in `AGENTS.md`),
  with default targets of critical 80%, high 70%, medium 60%, low 50% (3 of 3 for critical and
  high, 2 of 3 for medium and low) or a target on the 95% interval's lower bound. Always report
  the 95% interval and count. Stop early once remaining attempts cannot change the verdict, and
  record the attempts that ran ("2 of 2"). Read `references/measuring-runs.md` for the 4×4 matrix,
  intervals, stopping rule, cost, and tracking CSV.
- When one case runs across multiple workflow stages (such as planning, code review, and QA), give
  each stage its own effort-by-impact matrix, priority floor, and weight, and judge the case by
  its weighted average score and 95% credible interval. Read `references/workflow-evals.md` for the
  formula, per-stage floors, and spend-optimization rules.
- For a skill that loads on demand, report two layers per case: how often it loaded, and how
  often the case passed when it did. 2 of 3 loaded and 1 of 2 passed when loaded is 1 of 3
  overall; the priority target is for the overall rate. Hold loading to its own target, 80% by
  default, judged from six attempts or more. Fix low loading in the description, not the body.
- Pilot a new case with one attempt to check its graders. Measure with at least three attempts
  per arm before quoting a number.
- Compare a change against a control measured in the same session. Scores drift between days, so
  a stored number is not a control.
- Keep every attempt's trace, and read the failing attempts before changing anything. Decide
  whether the case, the grader, or the thing under test is wrong. Never loosen a grader to pass.
- When a change is aimed at one group of cases, also run the groups it does not target.
- Keep large raw results or transcripts out of git; update `README.md` and `HISTORY.md` before
  discarding them.

## After a run

1. Read every failing attempt in the arm under test.
2. Add the `HISTORY.md` entry.
3. Rebuild the `README.md` table from that run. Prefer a script over hand-copied numbers.
4. Update the one-line case descriptions for any case added, removed, or changed.
5. Commit the three files with the change that caused the run.

When a change edits a case or grader and no run was made, say so in `HISTORY.md` and mark the
affected `README.md` rows as not re-measured.

## Review

When a change quotes an eval score, check that it names the run (date, commit, models, attempts),
that both arms are given, that the number matches `README.md`, and that `HISTORY.md` has the
entry. Reject a claim of improvement that rests on a single attempt, on a ceiling case, or on a
comparison with a number from an earlier day.

An equal score means different things at the two ends. When both arms pass, the case is at the
ceiling: the suite ran on one model, and a model that already does the right thing cannot show
what a weaker one would do, so the score is evidence neither for the change nor against it. When
both arms fail a case that tests the changed rule, the rule did not work in those attempts: read
them, and fix the rule, the case, or its grader before keeping the change. An equal score between
the two is noise at this sample; measure more attempts before reading it.

When a change is kept on a ceiling score, it must say so and give the reason: the specific
mistake the rule prevents, and why a model would make it unprompted, such as a real incident, a
failing attempt from a weaker model, or a default the rule reverses. Reject "weaker models need
it" with no mistake named. Reject a change that scores below the baseline until a person has
accepted the trade.
