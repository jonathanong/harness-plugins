# Multi-stage workflow evals

Read this when one eval case (such as a production regression) is tested across multiple workflow
stages — for example, engineering planning, code review, and QA — and you need per-stage goals, a
combined case score with a 95% credible interval, and rules for prioritizing work and eval spend.

`scripts/eval_stats.py`, beside this skill, computes the weighted case score, its 95% credible
interval, per-stage floors, and the case verdict when the input CSV has a `stage` column.

## Per-stage priorities and case target

A case in a workflow eval has two levels of goals:

- **Per-stage effort × impact matrix and priority targets.** Each stage has its own difficulty
  profile, noise level, and cost, so each stage defines its own 4×4 effort × impact matrix (see
  `references/measuring-runs.md`) and its own priority target table in `AGENTS.md` (for example,
  code review critical 90%, QA critical 70%, QA low 50%). A single regression may be medium
  priority in planning, high in code review, and low in QA because catching it in QA is hard.
- **Case priority and target.** Each case also has its own overall priority and target (for
  example, `regression-1` critical 80%, or a 95% lower-bound target such as `> 50%`).

Per-stage targets are primarily **low floors** so a hard stage does not block a case unnecessarily;
the **case target** is what matters most.

- **Default verdict:** a case meets its goal when every applicable stage meets its stage floor
  **and** the combined case score meets the case target.
- **Combined-only override:** a suite's `AGENTS.md` may opt out of per-stage floors and judge
  cases solely by the combined case target, keeping per-stage scores as diagnostics to guide where
  to fix and where to spend eval budget.

## Stage weights and weighted case score

Give each stage a positive weight reflecting its role and cost as a gate. For example:

- **Planning (weight 1):** lowest weight because it is advisory, not a merge or release gate.
- **Code review (weight 3):** highest weight because it is the cheapest hard gate.
- **QA (weight 2):** second highest because it is a hard gate, but more expensive to run and fix.

When a suite sets no weights, every stage has weight `1` (an unweighted average).

Compute the case score as the weighted average of the applicable stages' pass rates:

```text
case_score = sum(w_i * p_i) / sum(w_i)
```

where `p_i = passed_i / attempts_i` and the sum runs only over the stages that apply to that case
(if a case has code review and QA but no planning stage, divide by `3 + 2 = 5`).

Use the weighted average rather than multiplying stage failure probabilities:

- It stays **conservative**: three stages at 70% score 70%, never inflated toward 97%, and no
  single stage hitting 3 of 3 can mask 0 of 3 elsewhere.
- **Higher-weight stages carry more of the passing requirement**: with weights `1, 3, 2`, code
  review is half the score; if code review scores 1 of 3, even 3 of 3 in both planning and QA only
  reaches 67%, missing a 70% bar.
- It stays on the same `0–100%` scale as priority targets, and requires no independence assumption
  between stages.

## Case 95% credible interval and verdict

Always report the **95% credible interval** beside the weighted case score, computed with the same
Beta-posterior model used for suite intervals in `references/measuring-runs.md`:

1. Draw 10,000 samples with a fixed seed.
2. In each draw, sample each stage's rate independently from `Beta(passed_i + 0.5, failed_i + 0.5)`.
3. Compute the weighted average `sum(w_i * rate_i) / sum(w_i)` for the draw.
4. Take the 2.5th and 97.5th percentiles.

Example with weights `plan = 1`, `code review = 3`, `QA = 2` at three attempts per stage:

| Stage results (`plan`, `CR`, `QA`) | Weighted score (95% CrI) | Notes                                              |
| ---------------------------------- | ------------------------ | -------------------------------------------------- |
| `3/3`, `3/3`, `3/3`                | 100 [64–99]              | Clears a 50% lower-bound bar                       |
| `2/3`, `3/3`, `2/3`                | 83 [50–93]               | Right at a 50% lower-bound bar                     |
| `2/3`, `3/3`, `1/3`                | 72 [43–87]               | Strong CR carries weak QA past 70%, misses >50% CI |
| `3/3`, `1/3`, `3/3`                | 67 [41–87]               | Weak CR drags the case under 70% despite 3/3 QA    |

- **Point-estimate verdict:** compare the exact weighted score against `case_target` using exact
  rationals (no floating-point rounding) — `scripts/eval_stats.py` handles this.
- **Lower-bound CI verdict:** a suite may instead (or also) require the 95% credible interval's
  lower bound to meet a bar (for example, `> 50%` for critical cases). This rewards allocating
  more attempts to higher-weight stages because misses there widen the lower tail most.
- **Early stopping:** if any stage stopped early or was skipped, do not report a combined rate or
  credible interval — stopping early biases the stage rate. Report stage counts and verdict only.

## Optimizing eval spend

Effort × impact priorities and stage weights tell an agent what to run, in what order, and how
many attempts to buy:

- **Run cheap, high-weight stages first.** During iteration or verdict-only sweeps, run the
  cheapest high-weight gate first (such as code review). Once a required stage floor misses — or
  the remaining unrun stages mathematically cannot raise the weighted score to the case target —
  skip expensive downstream stages (such as QA) and stop early.
- **Spend extra attempts where weight is highest.** When tightening a case's 95% credible interval
  (especially against a lower-bound target), add attempts to higher-weight, higher-priority stages
  first; keep expensive low-weight stages at the minimum count (3) or stop them early in
  verdict-only sweeps.
- **Separate verdict sweeps from recorded runs.** Use early stopping and stage skipping during
  iteration and cheap regression checks (verdict only). Run full planned attempts across every
  applicable stage before recording combined scores and 95% credible intervals in `README.md` and
  `HISTORY.md`.
- **Rerun by priority and weight-to-cost ratio.** After a model, prompt, or scorer change, rerun
  critical and high cases first — and their highest-weight cheap stages first — rather than paying
  for the whole workflow suite at once.

## Tracking CSV and README.md

Keep one source row per `(case, stage)` in `cases.csv`, and generate the per-case rollup table in
`README.md` from it so every score still has one source. Suggested workflow columns beside the
standard tracking columns:

- `stage`, `weight` (default `1`), `stage_priority`, `stage_target`, `attempts_planned`;
- `case_priority`, `case_target`, and optionally `case_ci_low_target`;
- `enforce_stage_floors` (default on; set in `AGENTS.md` rather than repeated per row when
  suite-wide).

Example `README.md` table (weights: planning 1, code review 3, QA 2):

| Case           | Planning (w=1)       | Code review (w=3)     | QA (w=2)             | Case score (95% CrI) | Case target | Verdict |
| -------------- | -------------------- | --------------------- | -------------------- | -------------------- | ----------- | ------- |
| `regression-1` | 67% (2/3, med: met)  | 100% (3/3, high: met) | 67% (2/3, low: met)  | 83 [50–93]           | 80%         | met     |
| `regression-2` | 100% (3/3, med: met) | 33% (1/3, high: miss) | 100% (3/3, low: met) | 67 [41–87]           | 70%         | missed  |
