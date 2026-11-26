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
  case is 3 of 3 would get `[100-100]`, which the per-case intervals contradict.
- **The gap between arms** gets its own interval, by the same bootstrap with the two arms of each
  case drawn together. A gap whose interval includes 0 does not show an improvement; it does not
  show there is none either.
- Read the interval before the rate. At three attempts, 3 of 3 cannot be told from a case that
  passes half the time. Say so when a decision rests on it.

## Priority and target

Give each case a priority by the cost of the mistake it catches, and a target pass rate for the
arm under test:

| Priority | Target | For a mistake that                                            | Passes needed of 3 |
| -------- | ------ | ------------------------------------------------------------- | ------------------ |
| Critical | 80%    | loses data, leaks a secret, moves money, or cannot be undone  | 3                  |
| High     | 70%    | breaks production or misleads a reviewer                      | 3                  |
| Medium   | 60%    | costs rework or review time; the default for an unmarked case | 2                  |
| Low      | 50%    | is a matter of style or wording                               | 2                  |

- Store the priority in the case, as a tag the runner can filter on, so a cheap run can take only
  the critical cases.
- A case meets its target when its passes reach `ceil(target x attempts)`. Every priority gets
  three attempts by default. A case may set more, for example to tell critical from high: at ten
  attempts they need 8 and 7. Compute it with whole numbers, `ceil(70 x 10 / 100)`; in floating
  point `ceil(0.7 x 10)` is 8.
- Report, per priority, how many cases meet their target.
- Mark a case **required** when one failure is unacceptable or its result does not vary between
  runs, such as a deterministic evaluator over a labelled set of inputs. A required case must pass
  every attempt, and one failure fails the run, whatever the other cases score. Report required
  cases as their own count, apart from the priorities. A deterministic case runs one attempt and
  gets no interval: an interval describes variation between attempts, and it has none. Say so
  where its result is shown.

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
target; 1 of 2 runs the third; a critical or high case misses at its first failure. Judges taking
a majority of three votes can stop the same way after two votes that agree.

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
- whether the skill loaded, the verdict (met or missed), whether the baseline arm is at the
  ceiling, and the gap between arms;
- total cost, and agent cost and judge cost when the runner reports them.

The CSV holds the current state, and its git history shows each row's changes; `HISTORY.md` is
still where a run is explained. Generate the `README.md` table from the CSV rather than copying
numbers by hand, and mark any row whose run differs from the newest, so each score has one
source.
