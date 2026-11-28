# Measuring a run: cost, intervals, targets, stopping early, tracking

Read this when choosing how many attempts a case gets, reporting a score or a run's cost, setting
targets, or writing the script that summarizes a run.

`scripts/eval_stats.py`, beside this skill, computes the intervals, the passes a target needs, and
each case's verdict from a CSV of passes and attempts, with the Python standard library only.
Run it, or import it from the script that summarizes a run, before writing the arithmetic again.

## Cost

- Record each run's cost in two parts, the agent's attempts and the judges, when the runner
  reports them apart; otherwise record the total. Also record cost per attempt. Compare cost per
  attempt between runs, since the total moves with the number of cases.
- Put the cost in every `HISTORY.md` entry and above the `README.md` table, so a rise shows up in
  the next run. Cost per attempt should fall over time, as cases stop early and graders move from
  a model to a deterministic check.
- Use a deterministic grader whenever the check is a string, a file, or a tool call. A model judge
  adds cost to every attempt and noise of its own.

## Confidence intervals

Report every rate with its 95% interval and its count: `67 [21-94], 2 of 3`.

- **Per case**, use the Wilson score interval on passes over attempts, for each arm. The normal
  approximation gives `[0-0]` for 0 of 3 and runs past 100 near the top; Wilson does neither.

  | Attempts | 0 passed | 1 passed  | 2 passed     | 3 passed     |
  | -------- | -------- | --------- | ------------ | ------------ |
  | 2        | 0 [0-66] | 50 [9-91] | 100 [34-100] |              |
  | 3        | 0 [0-56] | 33 [6-79] | 67 [21-94]   | 100 [44-100] |

- **Per suite**, average the per-case rates and give a bootstrap interval: draw the cases with
  replacement, and for each drawn case draw a rate from Beta(passes + 1/2, failures + 1/2);
  repeat 10,000 times with a fixed seed, and take the 2.5th and 97.5th percentiles. Resample
  cases, not attempts pooled across cases: attempts within a case are not independent, and
  pooling them gives an interval too narrow to trust. Draw the rate from the Beta, not from the
  case's own attempts: resampling three passes always gives three passes, so a suite where every
  case is 3 of 3 would get `[100-100]`, which the per-case intervals contradict. Call the result
  a 95% credible interval, not a confidence interval: it comes from a Beta posterior per case,
  so for a suite where every case passed its upper end sits just below 100 and never reaches it.
- **The gap between arms** gets its own interval, by the same bootstrap with the two arms of each
  case drawn together. A gap whose interval includes 0 does not show an improvement; it does not
  show there is none either.
- Read the interval before the rate. At three attempts, 3 of 3 cannot be told from a case that
  passes half the time. Say so when a decision rests on it.

## Priority and target

Set each case's priority from **effort** (how hard the mistake is to detect or handle reliably)
and **impact** (the cost of missing it), rather than impact alone. A low-effort bug with medium
impact is easy to catch and belongs at high or critical priority; a high-effort bug with the same
medium impact is genuinely hard and belongs at low or medium. Priority decides which cases to run
and improve first and where to spend eval budget, so a case that is cheap to catch and fix can
outrank a costly one with higher impact.

Default 4×4 mapping (use as a starting point; each suite defines and adjusts its own decision
matrix in `AGENTS.md` and documents it in `README.md`, and a multi-stage workflow suite defines
one matrix per stage):

| Impact \ Effort to catch | Low effort | Medium effort | High effort | Very high effort |
| ------------------------ | ---------- | ------------- | ----------- | ---------------- |
| **Critical**             | Critical   | Critical      | High        | Medium           |
| **High**                 | Critical   | High          | Medium      | Low              |
| **Medium**               | High       | Medium        | Low         | Low              |
| **Low**                  | Medium     | Low           | Low         | Low              |

Impact levels and default target pass rates for the arm under test:

| Priority | Target | Impact example (at medium effort)                             | Passes needed of 3 |
| -------- | ------ | ------------------------------------------------------------- | ------------------ |
| Critical | 80%    | loses data, leaks a secret, moves money, or cannot be undone  | 3                  |
| High     | 70%    | breaks production or misleads a reviewer                      | 3                  |
| Medium   | 60%    | costs rework or review time; the default for an unmarked case | 2                  |
| Low      | 50%    | is a matter of style or wording                               | 2                  |

- Store the priority in the case, as a tag the runner can filter on, so a cheap run can take only
  the critical cases.
- A case meets its point-estimate target when its passes reach `ceil(target x attempts)`. Every
  priority gets three attempts by default. A case may set more, for example to tell critical from
  high: at ten attempts they need 8 and 7. Compute it with whole numbers, `ceil(70 x 10 / 100)`. A
  floating-point product can land just above a whole number and round up one too many:
  `ceil(0.28 x 25)` is 8, not 7. The four default targets do not hit this at small counts; a custom
  target can.
- **Targeting the 95% lower bound**: a suite may instead (or also) set a target on the lower bound
  of the 95% interval — for example, requiring a critical case's 95% lower bound to be at least 50%.
  Always show the 95% interval either way. Because small samples have wide intervals, check that the
  planned attempt count can clear the bar: for a single stage, even 3 of 3 has a Wilson lower bound
  of 44%, so clearing 50% needs at least 4 attempts (4 of 4 gives 51%; 5 of 5 gives 57%; 7 of 8
  gives 53%).
- Report, per priority, how many cases meet their target.
- Mark a case **required** when one failure is unacceptable or its result does not vary between
  runs, such as a deterministic evaluator over a labelled set of inputs. A required case must pass
  every attempt, and one failure fails the run, whatever the other cases score. Report required
  cases as their own count, apart from the priorities. A deterministic case runs one attempt and
  gets no interval: an interval describes variation between attempts, and it has none. Say so
  where its result is shown.

## Two layers: loading, then passing

Most skills load on demand, so a case can fail in two places: the skill never loaded, or it
loaded and the answer was still wrong. Record both for each case, each with its own count:

| Layer              | Count                       | A low number means                     |
| ------------------ | --------------------------- | -------------------------------------- |
| Loaded             | attempts where it loaded    | the description or the prompt is wrong |
| Passed when loaded | passes among those attempts | the skill's body is wrong or unclear   |
| Passed overall     | passes over all attempts    | one of the two above; read them to see |

- The overall rate is what a person using the skill gets, so the priority target applies to it.
  2 of 3 loaded and 1 of 2 passed when loaded is 1 of 3 overall: write all three counts, not only
  the last.
- An attempt where the skill did not load counts as it scored. It usually fails. When it passes,
  it is a pass, and it shows the model did not need the skill for that prompt.
- Loading has its own target, 80% by default for every on-demand skill, whatever the priority of
  its cases. Judge it per skill, over the attempts of all its cases: three attempts of one case
  cannot tell a 70% loading rate from a 90% one. Also name any single case that loads in under
  half of its attempts.
- Run at least six attempts of a case before quoting how often it loads. The same case, with
  the same description, can load in 1 of 3 one day and 3 of 3 the next.
- Keep the trace of every attempt. An attempt that did not load is explained only by its trace:
  it called no skill, or it called a neighbor. A run that discards traces has to be paid for
  again to learn which.
- The two targets multiply. A critical case at 80% overall, on a skill that loads 80% of the
  time, has to pass every time it loads only if its unloaded attempts never pass. Unloaded passes
  lower that requirement. So raise the loading target toward 100% for a skill with critical
  cases, or expect those cases to miss.
- Passed when loaded has no target of its own by default; it is there to say what to fix. When
  the skill never loaded, write "not measured" for it, not 0.
- Give each layer its interval from its own count: loading over all attempts, passed when loaded
  over the attempts that loaded.
- A skill that is always in context has one layer. Leave the loading columns out.

## Suite and group goal

A suite, or a group such as one skill's cases, meets its goal when every case meets its own
target: "12 of 12 cases met their target", not a 100% pass rate on every attempt. A tool that does
one job, such as a code reviewer, is one suite. A plugin of skills is one group per skill, and
each case in a group has its own priority.

- Spread a group's cases across the distinct rules of what it tests, one case per rule that
  matters, not several versions of one prompt. For each rule, name the case that would fail if the
  rule were removed; a rule with no such case is unmeasured.
- The more cases a group has, the likelier one misses by chance: if each case meets its target 90%
  of the time, ten cases all meet theirs 35% of the time, and twenty only 12%. So rerun a case
  that misses with more attempts before calling it a regression. A case that misses again is a
  failure to read and fix, not noise to average away.

## Stopping early

Run attempts in rounds, and stop a case once the attempts left cannot change its verdict. With
`n` attempts and `k = ceil(target x n)` passes needed:

- the case **meets** its target once it has `k` passes;
- it **misses** once its passes plus the attempts left are fewer than `k`;
- otherwise run another attempt.

At three attempts: 2 of 2 meets a medium or low target and skips the third; 0 of 2 misses every
target; 1 of 2 runs the third for a medium or low case and misses a critical or high one, which
needs all three; 2 of 2 on a critical or high case runs the third. Judges taking
a majority of three votes can stop the same way after two votes that agree.

- Run at least two attempts before any verdict. A critical or high case has already missed at
  its first failure, but the second attempt costs little beside a verdict that would rest on
  one attempt.
- Take the planned number of attempts from your own configuration, not from a field the runner
  echoes back: a runner that reports the round's size there makes every case look finished after
  its first round.
- Record the attempts actually run: "2 of 2", never "3 of 3". Give a case that stopped early its
  count and its verdict, with no interval: the interval assumes the number of attempts was fixed
  before the run. Such a row is a verdict, not a rate to quote.
- Stop early only when the question is the verdict against a target. When the question is a rate,
  run every attempt: a loading rate, a description A/B, or a with-vs-without gap a change will
  quote. A rate from attempts that stopped when they looked good is biased toward the stopping
  point.
- The target belongs to the arm under test, so only that arm stops early. A baseline arm has no
  target; run all of its attempts.
- Stopping early needs a runner that runs attempts in rounds, or a driver that reruns only the
  undecided cases and merges their results. If neither exists, say so rather than reporting a
  partial run as a full one.

## Tracking file

Keep the latest result of every case in one committed CSV beside the cases, such as
`evals/cases.csv`, with one row per case. A script writes it after each run and replaces only the
rows of the cases that run covered. Suggested columns:

- case, skill or group, priority, target, attempts planned;
- run date, commit, agent model, judge model, harness version;
- for each arm: passed, attempts run, rate, interval low, interval high, and the score when the
  suite's score is not the pass rate, such as a share of graders passed;
- how many attempts the skill loaded in, how many of those passed, the verdict (met or missed),
  whether the baseline arm is at the ceiling, and the gap between arms;
- total cost, and agent cost and judge cost when the runner reports them.

For an arm that stopped early, leave its rate, its interval, and the gap empty, and keep the
count and the verdict, so a table generated from the CSV cannot show a stopping-point rate as a
measurement.

When the way a number is counted changes, the old rows are no longer comparable with the new
ones. Mark them, and rerun them in order of priority, critical and high first, instead of
paying for the whole suite at once. Say in `README.md` which rows still use the old count.

The CSV holds the current state, and its git history shows each row's changes; `HISTORY.md` is
still where a run is explained. Generate the `README.md` table from the CSV rather than copying
numbers by hand, and mark any row whose run differs from the newest, so each score has one
source.
