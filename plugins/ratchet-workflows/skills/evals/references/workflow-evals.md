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

**Litmus test:** if stage A catches the issue, does stage B become unnecessary? Use Noisy-OR when a
case passes through dependent defense-in-depth layers and only fails if every layer misses it.

**Use-cases:**

- **Regression pipelines:** engineering planning → code review → QA (a bug blocked in code review
  never reaches QA).
- **Layered safety or security guards:** input filter → tool guard → output verifier (blocking a
  secret leak or unsafe action at any layer prevents the incident).
- **Redundant detection:** static check → review agent → staging canary (any one layer catching the
  defect stops a customer-facing failure).

**How to set `effectiveness` (`e_i` in `(0, 1]`, default `1.0`):**

- **`1.0` for hard gates** where a catch blocks merge, release, or execution (code review, CI
  check, QA release gate, runtime guard). With two hard gates at `1.0`, a 70% code review and a 50%
  QA combine to `1 - (1 - 0.70)(1 - 0.50) = 85%`, and 100% code review makes QA unnecessary.
- **`0.3–0.6` for advisory or soft stages** that warn without blocking (planning review, design
  review, non-blocking bot comment). Pick roughly the fraction of flagged issues that get fixed
  rather than ignored; planning alone then contributes at most `e_plan` to the case score (still
  keep stage floors enabled when downstream gates are required to pass, since a low case target
  such as 50% could otherwise pass on planning alone).
- **`0.6–0.9` for discounted late or expensive gates** (optional): set `e_qa < 1.0` (for example
  `e_plan = 0.33`, `e_cr = 1.0`, `e_qa = 0.67`) when you want the combined score itself to penalize
  relying on slow, costly late catches. Alternatively, keep every hard gate at `1.0` so the score
  stays a literal catch rate, and enforce catching early with per-stage floors and run order.
- **Sanity check:** a stage scoring 100% alone yields a case score of `e_i`. Never set `e_i = 1.0`
  on a stage that should not be able to carry the case by itself.

**Pitfalls and caveats:**

- **Do not put weights as exponents on `p_i` (`1 - p_i^w_i`)**: for `0 < p < 1`, raising `p` to a
  higher power shrinks it and inverts the weights. Do not use unnormalized `(1 - p_i)^w_i` either:
  it pretends one stage ran `w_i` independent times and inflates scores.
- **Pair with a 95% lower-bound target to stay conservative.** Under Noisy-OR, `3 of 3` on a hard
  gate gives a 100% point estimate even when other stages score `0 of 3`, but its 95% credible
  interval lower bound is only ~53%. Targeting the lower bound prevents small samples from passing
  on luck.
- **State the independence caveat in `README.md` ("What the suite does not measure").** Multiplying
  `(1 - e_i * p_i)` assumes stage misses are independent. Positively correlated misses (for
  example, the same model or blind spot running across stages) can make Noisy-OR optimistic, while
  negatively correlated misses (stages catching disjoint failure modes) can make it pessimistic,
  unless measured end-to-end.

### Independent dimensions: weighted average (`sum(w_i * p_i) / sum(w_i)`)

**Litmus test:** does every stage or dimension still matter even when another one scores 100%? Use
a weighted average when stages stand on their own and passing one does not cover the others.

**Use-cases:**

- **Separate deliverables across a workflow:** one task evaluated on spec quality, code
  correctness, and migration or documentation completeness — a strong spec does not cover broken
  code or missing docs.
- **Parallel rubric dimensions on one output:** grading a single change on correctness, security,
  and maintainability. Note that a weighted average alone can offset a low dimension (with equal
  weights and floors off, 0% security and 100% on the other two yields 67%), so keep a stage floor
  on any non-negotiable dimension such as security when a miss must block the case.
- **Cross-surface coverage:** one behavior checked on web, mobile, and API — passing on web does
  not make a broken mobile client acceptable.
- **Model or environment matrices:** the same case evaluated across several models, languages, or
  harnesses when you want one conservative summary rate rather than "at least one succeeded."

**How to set `weight` (`w_i > 0`, default `1`):**

- **Default to `1` for every dimension** (unweighted average) until you have a concrete reason to
  weight them differently. Sum only over the dimensions that apply to a given case.
- **Use small integers (such as `1, 2, 3`)** rather than false-precision decimals:
  - By importance or cost of failure: primary requirement or core gate `3`, secondary requirement
    `2`, advisory or polish `1`.
  - By workload share: if 60% of traffic is API, 30% web, and 10% CLI, use `6, 3, 1`.
- **Sanity check blocking power:** a dimension with share `w_i / sum(w)` caps the case score at
  `100% - share` when it scores 0%. With weights `1, 3, 2` (sum `6`), the weight-3 dimension holds
  50% of the score — failing it caps the case at 50% (cannot clear a 60–80% bar) — while failing
  the weight-1 dimension still leaves up to 83% reachable. Pick weights so the dimensions that must
  succeed carry enough share to block the case when they fail.
- Stays conservative (three stages at 70% score 70%, never inflated), stays on the `0–100%` scale,
  and its point estimate requires no independence assumption between stages.

## Case 95% credible interval and verdict

Always report the **95% credible interval** beside the combined case score, computed with the same
Beta-posterior model used for suite intervals in `references/measuring-runs.md`:

1. Draw 10,000 samples with a fixed seed.
2. In each draw, sample each stage's rate independently from `Beta(passed_i + 0.5, failed_i + 0.5)`.
3. Plug the drawn rates into the suite's combining formula (Noisy-OR or weighted average).
4. Take the 2.5th and 97.5th percentiles.

Step 2 assumes each stage's attempts were sampled **separately**. When multiple weighted dimensions
are graded on the **same** attempts (such as parallel rubric scores on one set of runs),
independent Beta draws count one body of evidence several times and produce an overly narrow
interval, while a plain bootstrap over attempts collapses to `[100-100]` whenever every attempt
scores 100%. For shared-trial rubrics, omit the weighted score's interval and lower-bound CI
verdict (noting that the dimensions share trials); if you also want a 95% interval, report a
per-attempt binary pass rate and its Wilson interval separately, not as an interval on the weighted
score.

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
  reaches a 72% lower bound even when QA scores 0 of 3 — still running QA's planned attempts if QA
  is included in the recorded case, or omitting QA from that case's stages) or backstop code review
  with passing QA runs.
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
- `case_priority`, `case_target`, and optionally `case_ci_low_target` (repeat consistently across a
  case's rows or leave blank after the first row; conflicting values on the same case are rejected);
- `combine` (`noisy-or` or `weighted`) and `enforce_stage_floors` (default on) live in `AGENTS.md`
  rather than repeated per row when suite-wide.

Example `README.md` table (sequential Noisy-OR, `e_plan = 0.5`, `e_cr = 1.0`, `e_qa = 1.0`):

| Case           | Planning (e=0.5)    | Code review (e=1.0)   | QA (e=1.0)           | Case catch rate (95% CrI) | Case target (CI low) | Verdict |
| -------------- | ------------------- | --------------------- | -------------------- | ------------------------- | -------------------- | ------- |
| `regression-1` | 67% (2/3, med: met) | 100% (3/3, high: met) | 67% (2/3, low: met)  | 100 [83–100]              | 80% (>= 50%)         | met     |
| `regression-2` | 67% (2/3, med: met) | 67% (2/3, high: miss) | 33% (1/3, low: miss) | 85 [54–99]                | 80% (>= 50%)         | missed  |
