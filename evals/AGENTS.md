# Eval rules

The suite runs with `claude plugin eval`, once per plugin: a case runs with its own plugin installed
and no other. `cases.csv` in this directory holds one row per case with its
latest result; `EVALS.md` and the roll-up by skill in `README.md` are generated from it, and `HISTORY.md` holds the log. The `evals` skill in `ratchet-workflows` describes how the three files
work; follow it.

## Run

```bash
pnpm run evals                  # every case, each with its plugin
pnpm run evals <skill> ...      # the cases of those skills, in their plugins
EVAL_FLAGS='--runs 1' pnpm run evals <skill>              # pilot a new case
EVAL_ABLATION=with-without pnpm run evals <skill>         # add a no-plugin arm
EVAL_STOP_EARLY=1 pnpm run evals <skill>                  # stop each case once its verdict is settled
python3 scripts/eval-summary.py                           # write the run's rows to cases.csv
python3 scripts/eval-docs.py                              # rebuild EVALS.md and the README tables
```

- Sonnet is the agent and Opus is the judge. Measure with three attempts, the default. Quote a
  loading rate only from six attempts or more of a case.
- `pnpm run evals` keeps every attempt's trace, under the path each failed attempt prints. Do
  not turn that off: a run without traces cannot say why an attempt did not load.
- The default run has no no-plugin arm. Run that arm once for a new case, to check that the model
  does not already pass it without the skill, and record what it scored in `HISTORY.md`.
- `scripts/eval-summary.py` records two layers for each case: `loaded`, the attempts where
  `skill-fired` passed, and `with_passed`, the attempts where every other grader passed. A
  case's verdict is on `with_passed`. A skill's loading is judged apart, against 80% of the
  attempts of all its cases. Use that script's numbers, not the runner's report, which counts
  `skill-fired` in one arm's score and not the other's.
- `EVAL_STOP_EARLY=1` runs two attempts and then one at a time, with the plugin only, and stops a case
  once the attempts left cannot change its verdict against its target. Use it for a regression
  run or to check that cases still meet their targets. Do not use it for a number a change will
  quote: a with-vs-without gap, a loading rate, or a description A/B runs every attempt. Set
  `EVAL_MAX_COST_USD` to cap what each plugin's run spends.
- The run needs model credentials and executes each case's `fixture.sh` on the machine. Run it
  only on a checkout you trust. It does not run in CI.

## Cases

- Layout: `plugins/<plugin>/evals/<skill>/<case>/prompt.md`, `graders/*.md`, and an optional `fixture.sh`.
- A case with a `fixture.sh` also needs a `case.yaml` that names the case and sets
  `context.scaffold_script: fixture.sh`. Without it the fixture does not run and the agent starts
  in an empty directory. Read one pilot trace before measuring.
- A case that edits files lists `Bash` in `allowed_tools`, not `Edit` or `Write`. The runner
  grants Bash only, and a grant applies to every case. An agent that sees a tool it may not use
  can decline to edit through the shell.
- Tag every case with its skill name.
- A case sits in its skill's plugin and is named `<skill>/<case>` in `cases.csv`. Only that plugin
  is installed when it runs, so a case cannot require a skill of another plugin to load.
- A case's priority is a tag: `priority-critical`, `priority-high`, or `priority-low`. A case with
  none is medium. The `evals` skill's `references/measuring-runs.md` defines the four levels and
  their targets. Set it from effort and impact with that file's 4×4 matrix: how hard the mistake
  is to catch and fix, and what missing it costs, not by the skill's topic.
- Every case has `graders/skill-fired.md`: a `tool_used` grader on the `Skill` tool that names the
  skill. `pnpm run evals:check` fails a skill with no such case.
- Every case has at least one more grader that checks the outcome. Skill-fired alone proves
  nothing about the answer.
- When the work also needs a companion skill that the skill names, a case may add a second
  `tool_used` grader for it. Do not add a `max: 0` grader against a neighboring skill; loading
  both is fine.
- Write the prompt as a person would ask it. Do not use the skill's own wording, and do not name
  the skill.
- Build a case on a decision the model gets wrong without the skill.
- Put the agent inside the work, on a fixture when the work needs files. Do not write a case
  that asks about the rule directly: such a prompt loads no skill and passes unaided.
- A case the model passes without the skill may be dropped, and `HISTORY.md` records it. The rule
  it covered stays in the skill, because weaker models need it: the change names the mistake the
  rule prevents, as the Review section of the `evals` skill requires. Never cite a ceiling case as a reason to
  remove a rule or to hold back a new one. A new skill whose drafted cases all pass without it
  ships with one of them as its loading check; say in its `EVALS.md` note that it is a ceiling
  case, and list a harder case in `ROADMAP.md`. An existing skill may keep a ceiling case the same
  way when it is the case that shows the skill loads.
- The exception is a guard case: one that checks a rule is not applied where it does not hold.
  It may pass without the skill. Add one only beside a case for the same rule that the model
  fails without the skill, and start its `EVALS.md` row with "Guard:" and say so in `HISTORY.md`. A guard for a skill
  that should not act at all (a plan for a trivial change) has no `skill-fired` grader, because
  loading the skill is not the thing it checks; tag it `guard`, not `skill-fired`.
- Keep prompts and fixtures free of the names of real organizations and of private repositories
  and products. Naming a public library or tool the case is about is fine.

## Graders

- Use an `llm` grader for a judgment. State what passes and what fails.
- Use a `regex` grader for a fact. Anchor a pattern about a command to the Bash `"command"` input;
  a pattern over the whole transcript also matches the prompt and the fixture.
- Grade the rule the case is named for. A grader that also requires rules from other parts of
  the skill fails good answers and hides which rule was missed.
- Do not loosen a grader to make an attempt pass. Read the trace first and decide whether the
  case, the grader, or the skill is wrong.

## Actions a case must never perform

- No real `npm publish` and no mutating `npm trust`. Fixtures point at a dead local registry, and
  the graders check the commands the agent attempts.
- No write to a hosted service: no issue, comment, label, or pull request.
- No reading of credentials: never `cat ~/.npmrc` and never dump the environment.

## Kinds of run

The `evals` skill's `references/eval-types.md` defines each kind. Here:

| Kind             | Command                                                               |
| ---------------- | --------------------------------------------------------------------- |
| With vs. without | `EVAL_ABLATION=with-without pnpm run evals <skill>`                   |
| Loading          | `EVAL_FLAGS='--runs 8 --case <case>' pnpm run evals <skill>`          |
| Description A/B  | The loading command once per description version, in the same session |
| Neighbors        | A case with a `tool_used` grader for each skill that should load      |
| Guard            | The with-vs-without command; label the case a guard                   |
| Regression       | `pnpm run evals` after a Claude Code or model upgrade                 |

- Before changing a description to make a skill load, run the A/B on the cases that miss and keep
  the change only if it loads more often.
- Check in the traces whether a miss called no skill or another one. No call
  needs a clearer trigger; a neighbor's call needs the two descriptions to divide the work.

## Record

- After a measured run, add an entry at the top of `HISTORY.md` with the run's cost, split into
  agent and judges, and run `scripts/eval-summary.py`. It replaces the rows of the cases that ran
  in `cases.csv` and leaves every other row. After a partial run (one skill or `--case`), say
  which run the new rows came from under "Where each row comes from" in `EVALS.md`.
- Then run `scripts/eval-docs.py`. It rebuilds the case table in `EVALS.md`, the per-skill table
  in `README.md`, and the headline in `README.md` and the root `README.md`. Do not edit those
  blocks by hand; a case's one-line description is the `checks` column of `cases.csv`.
  `pnpm run evals:check` fails when a block is out of date or when `cases.csv` and the case
  directories differ.
- A row that stopped early shows the attempts that ran, such as "2 of 2", and a verdict. It is
  not a rate; do not quote it as one.
- When the way a count is made changes, rerun the old rows by priority, critical and high first,
  not the whole suite, and say in `README.md` which rows still use the old count.
- A change to a case, grader, or fixture with no run still gets a `HISTORY.md` entry. Say under
  "Where each row comes from" that the affected rows were not re-measured.
- Planned work goes in the root `ROADMAP.md`, not in `README.md` or `EVALS.md`.
- `evals/results/` is ignored by git, so `cases.csv` and `HISTORY.md` are the only durable record.
