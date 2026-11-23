# Roadmap

Planned work, most certain first. An item leaves this file when its pull request merges.

## Skills: add

A skill does not wait for a case the current model fails; weaker models need the rules too.
Each still gets a loading case and an answer case.

- [ ] Security review, performance measurement, incident response, release notes.

## Evals

- [ ] **Replace cases the model passes unaided.** [evals/EVALS.md](evals/EVALS.md) lists them:
      every row with 1.00 in "Without plugin" that is not a guard.
- [ ] **A case that shows each skill helps** for `postgres-schema-design`, `review-ci-logs`, and
      `package-json-checklist`.
- [ ] **Cases that still load their skill in under eight of eight attempts:**
      `planning/plan-states-before-after` (5 of 8) and
      `static-analysis-checklist/tracked-files-only` (6 of 8).
- [ ] **`list-reads` needs a case for writing a list endpoint, and a check that it stays out
      of the way.** Its description now opens with any query that returns a list. Add a case
      that writes one, and a guard where a single-row query must not load it.
- [ ] **The pagination rules need a server-side case and a native case.** Add a `list-reads`
      case where a capped walk must set `has_next_page` on an empty page, and a
      `native-app-architecture` case for the client rule.
      `react-app-structure/load-more-follows-the-flag` loads its skill in 9 of 12 attempts.
- [ ] **`test-authoring` needs a flake-fix case the model fails unaided.** Two review cases with
      the diff in the prompt passed without the skill. Try a task on a fixture repository with
      a failing test, where the tempting change is a retry or a sequential suite.
- [ ] **`test-authoring/dotnet-private-field-not-reflected` loads its skill in about half its
      attempts** on every description tried (8, 8, and 5 of 12). Find out why a request to
      write a .NET test does not load it.
- [ ] **`dependabot` needs a repair case the model fails unaided.** `repair-pr-with-pushed-fix`
      is a ceiling case. Try a fixture where the commits are not in the prompt and the agent has
      to read them before it comments.
- [ ] **`git-commit-checklist` needs a generated-file conflict the model fails unaided.**
      `generated-file-conflict-on-rebase` is a ceiling case. Try a fixture where the generator
      command is not in the file's header, or the conflict is in a generated project file.
- [ ] **`llm-calls` needs a case the model fails unaided.** Its one case is a ceiling case.
      Candidates: a model id defaulted in code, and a tool that trusts a model-supplied limit.
- [ ] **`agent-coordination` and `verification` load in 0 of 12,** and a plainer description did
      not change that: their cases ask a direct question and the agent answers it. Each needs a
      case inside real work on a fixture repository, as do `expand-contract-migrations` and
      `resuming-work`, whose cases pass unaided.
- [ ] **`debugging` loads in 4 of 12 and its case passes unaided.** A plainer description reached
      9 of 12 but may cost loads on a `postgres-node-performance-tuning` case
      (`evals/HISTORY.md`, 2026-11-22). Build a case on a fixture repository with a real failing
      command, where the tempting fix is wrong, then measure descriptions with the arms
      interleaved.
- [ ] **Three cases load their skill in most attempts, not all:**
      `review-ci-logs/quiet-log-keeps-errors` in 7 of 9,
      `github-actions-authoring/required-check-is-a-real-job` in 11 of 15, and
      `index-change-rechecks-neighbors` in 19 of 21. Read the misses.
- [ ] **Replace `bounded-iteration/review-sweep-rewrites-its-trigger`:** the model passes it with
      no skill loaded.
- [ ] **Cases for the rules added without one.** A prompt with the code or the list inline did not
      work: the model passed five of seven unaided. Build them on a fixture or a longer task:
      asking less in `planning` and `github-issue`; language-model calls in `service-boundaries`;
      handler order and API keys in `http-api-design`.
- [ ] **Cases built on a fixture** for the merge, close, stack, and readiness rules in
      `pull-requests`. A prompt that lays out the pull request's state gives the answer away.
- [ ] **One full two-arm run** so every row comes from the same run, with more than three attempts
      where a case sits between pass and fail.
- [ ] **Report how often each skill loads** beside its score.
- [ ] **Anchor pattern graders** to the command the agent ran, and split graders that check two
      things.
