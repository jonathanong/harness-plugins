# Multi-stage workflow evals

Read this when one eval case (such as a production regression) is tested across multiple workflow
stages — for example, engineering planning, code review, and QA — and you need per-stage goals, a
combined case score with a 95% credible interval, and rules for prioritizing work and eval spend.

`scripts/eval_stats.py`, beside this skill, computes both combined scores, the 95% credible
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

## Two ways to combine stages

Pick the combining formula that matches how the stages relate to each other, and record it in
`AGENTS.md` and `README.md`:

| Workflow shape             | When to use                                                                        | Formula                     | Parameter (`eval_stats.py`)                                 |
| -------------------------- | ---------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| **Sequential gates**       | Catching a bug in an earlier stage makes later stages unnecessary (plan → CR → QA) | `1 - prod(1 - e_i * p_i)`   | `effectiveness` in `(0, 1]` (`--combine noisy-or`, default) |
| **Independent dimensions** | Every stage or dimension counts on its own; catching one does not cover the rest   | `sum(w_i * p_i) / sum(w_i)` | `weight > 0` (`--combine weighted`)                         |

### Sequential gates: Noisy-OR (`1 - prod(1 - e_i * p_i)`)

Use Noisy-OR for a dependent defense-in-depth pipeline where a bug escapes only if every stage
misses it (for example, engineering planning → code review → QA):

- Each stage has an **effectiveness** `e_i` in `(0, 1]` (default `1.0`).
  - Hard gates (code review, QA) default to `1.0`: a 70% code review and a 50% QA combine to
    `1 - (1 - 0.70)(1 - 0.50) = 85%`, and if code review catches 100%, QA does not matter.
  - Advisory or non-gate stages (such as planning) take `e_i < 1.0` (for example `0.5` or `1/3`),
    so even 100% in planning caps at `e_plan` and can never mask broken downstream gates.
  - A suite that wants the score itself to favor cheaper gates may also discount an expensive late
    gate (for example `e_plan = 0.33`, `e_cr = 1.0`, `e_qa = 0.67`), or keep both gates at `1.0`
    and enforce catching early via per-stage floors and run order.
- **Do not put weights as exponents on `p_i` (`1 - p_i^w_i`)**: for `0 < p < 1`, raising `p` to a
  higher power shrinks it and inverts the weights. Do not use unnormalized `(1 - p_i)^w_i` either:
  it pretends one stage ran `w_i` independent times and inflates scores.
- **Pair with a 95% lower-bound target to stay conservative.** Under Noisy-OR, `3 of 3` on a hard
  gate gives a 100% point estimate even when other stages score `0 of 3`, but its 95% credible
  interval lower bound is only ~53%. Targeting the lower bound prevents small samples from passing
  on luck.
- **State the independence caveat in `README.md` ("What the suite does not measure").** Multiplying
  `(1 - e_i * p_i)` assumes stage misses are independent. When the same model or blind spot runs
  across stages, misses correlate and the true catch rate is lower, so Noisy-OR is an optimistic
  upper bound unless measured end-to-end.

### Independent dimensions: weighted average (`sum(w_i * p_i) / sum(w_i)`)

Use a weighted average when stages or dimensions are independent and catching one does not make the
others moot (for example, scoring separate requirements or parallel checks on one case):

- Give each dimension a positive `weight` (default `1` for an unweighted average), summing only
  over the dimensions that apply to that case.
- Stays conservative (three stages at 70% score 70%, never inflated), gives higher-weight
  dimensions more control over passing, stays on the `0–100%` scale, and requires no independence
  assumption.

## Case 95% credible interval and verdict

Always report the **95% credible interval** beside the combined case score, computed with the same
Beta-posterior model used for suite intervals in `references/measuring-runs.md`:

1. Draw 10,000 samples with a fixed seed.
2. In each draw, sample each stage's rate independently from `Beta(passed_i + 0.5, failed_i + 0.5)`.
3. Plug the drawn rates into the suite's combining formula (Noisy-OR or weighted average).
4. Take the 2.5th and 97.5th percentiles.

Example at three attempts per stage (Noisy-OR with `e_plan = 0.5`, `e_cr = 1.0`, `e_qa = 1.0` vs.
weighted average with `w = 1, 3, 2`):

| Stage results (`plan`, `CR`, `QA`) | Noisy-OR `e=(0.5, 1, 1)` (95% CrI) | Weighted `w=(1, 3, 2)` (95% CrI) |
| ---------------------------------- | ---------------------------------- | -------------------------------- |
| `3/3`, `3/3`, `3/3`                | 100 [94–100]                       | 100 [64–99]                      |
| `2/3`, `3/3`, `1/3`                | 100 [75–100]                       | 72 [43–87]                       |
| `0/3`, `3/3`, `0/3`                | 100 [55–100]                       | 50 [28–67]                       |
| `2/3`, `2/3`, `1/3`                | 85 [54–99]                         | 56 [26–79]                       |
| `3/3`, `0/3`, `0/3`                | 50 [33–82]                         | 17 [12–48]                       |

- **Point-estimate verdict:** compare the exact combined score against `case_target` using exact
  rationals (no floating-point rounding) — `scripts/eval_stats.py` handles both modes.
- **Lower-bound CI verdict:** a suite may instead (or also) require the 95% credible interval's
  lower bound to meet a bar (for example, `> 50%` or `> 70%` for critical cases). Under Noisy-OR,
  clearing a higher lower-bound bar lets a team either add cheap attempts to code review (`10 of 10`
  reaches 72% lower bound without needing QA) or backstop it with QA.
- **Early stopping:** if any stage stopped early or was skipped, do not report a combined rate or
  credible interval — stopping early biases the stage rate. Report stage counts and verdict only.

## Optimizing eval spend

Effort × impact priorities, stage effectiveness/weights, and stage costs tell an agent what to run,
in what order, and how many attempts to buy:

- **Run cheap, high-leverage stages first.** During iteration or verdict-only sweeps, run the
  cheapest primary gate first (such as code review). Once a required stage floor misses — or the
  remaining unrun stages mathematically cannot raise the combined score to the case target — skip
  expensive downstream stages (such as QA) and stop early. In a combined-only Noisy-OR point-target
  sweep, a hard gate hitting 100% can likewise settle the case without running QA.
- **Spend extra attempts where leverage is highest.** When tightening a case's 95% credible
  interval (especially against a lower-bound target), add attempts to higher-effectiveness or
  higher-weight cheap stages first; keep expensive stages at the minimum count (3) or stop them
  early in verdict-only sweeps.
- **Separate verdict sweeps from recorded runs.** Use early stopping and stage skipping during
  iteration and cheap regression checks (verdict only). Run full planned attempts across every
  applicable stage before recording combined scores and 95% credible intervals in `README.md` and
  `HISTORY.md`.
- **Rerun by priority and leverage-to-cost ratio.** After a model, prompt, or scorer change, rerun
  critical and high cases first — and their cheapest primary stages first — rather than paying for
  the whole workflow suite at once.

## Tracking CSV and README.md

Keep one source row per `(case, stage)` in `cases.csv`, and generate the per-case rollup table in
`README.md` from it so every score still has one source. Suggested workflow columns beside the
standard tracking columns:

- `stage`, `effectiveness` (for `--combine noisy-or`, default `1`) or `weight` (for `--combine
  weighted`, default `1`), `stage_priority`, `stage_target`, `planned`;
- `case_priority`, `case_target`, and optionally `case_ci_low_target`;
- `combine` (`noisy-or` or `weighted`) and `enforce_stage_floors` (default on) live in `AGENTS.md`
  rather than repeated per row when suite-wide.

Example `README.md` table (sequential Noisy-OR, `e_plan = 0.5`, `e_cr = 1.0`, `e_qa = 1.0`):

| Case           | Planning (e=0.5)    | Code review (e=1.0)   | QA (e=1.0)           | Case catch rate (95% CrI) | Case target (CI low) | Verdict |
| -------------- | ------------------- | --------------------- | -------------------- | ------------------------- | -------------------- | ------- |
| `regression-1` | 67% (2/3, med: met) | 100% (3/3, high: met) | 67% (2/3, low: met)  | 100 [83–100]              | 80% (>= 50%)         | met     |
| `regression-2` | 67% (2/3, med: met) | 67% (2/3, high: miss) | 33% (1/3, low: miss) | 85 [54–99]                | 80% (>= 50%)         | missed  |
