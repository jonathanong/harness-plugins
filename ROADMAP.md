# Roadmap

Planned work, most certain first. An item leaves this file when its pull request merges.

## Skills: add

A skill does not wait for a case the current model fails; weaker models need the rules too.
Each still gets a loading case and an answer case.

- [ ] Security review, performance measurement, incident response, release notes.

## Evals

- [ ] **Replace cases the model passes unaided.** [evals/EVALS.md](evals/EVALS.md) lists them:
      every row with 1.00 in "Without plugin" that is not a guard.
- [ ] **A case that shows each skill helps** for `review-ci-logs` and
      `package-json-checklist`.
- [ ] **Cases that still load their skill in under eight of eight attempts:**
      `planning/plan-states-before-after` (5 of 8) and
      `static-analysis-checklist/tracked-files-only` (6 of 8).
- [ ] **`react-app-structure/load-more-follows-the-flag` loads its skill in 9 of 12
      attempts.** Read the misses.
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
- [ ] **`postgres-node-performance-tuning/dedupe-keeps-statement-names-literal` loads its
      skill in 5 of 12 attempts.** A request to clean up duplicated queries does not load it,
      and naming refactoring in the description did not help.
- [ ] **`error-handling` needs a reporting case the model fails unaided.** Its reporting case
      is a ceiling case, and so were two pilots on a ten-file fixture, where the model
      followed the imports to the tracker call (`evals/HISTORY.md`, 2026-11-23). Try a fixture
      where that path is longer, or a review of a diff that reports a caller's mistake.
- [ ] **`agent-coordination` and `verification` load in 0 of 12,** and a plainer description did
      not change that: their cases ask a direct question and the agent answers it. Each needs a
      case inside real work on a fixture repository, as do `expand-contract-migrations` and
      `resuming-work`, whose cases pass unaided.
- [ ] **`debugging` needs a case the model fails unaided.** Its fixture case loads the skill
      in 14 of 15 and passes without it (`evals/HISTORY.md`, 2026-11-22). Candidates: a failure
      that cannot be reproduced locally, and one that needs a bisect to find.
- [ ] **Three cases load their skill in most attempts, not all:**
      `review-ci-logs/quiet-log-keeps-errors` in 7 of 9,
      `github-actions-authoring/required-check-is-a-real-job` in 11 of 15, and
      `index-change-rechecks-neighbors` in 19 of 21. Read the misses.
- [ ] **Replace `bounded-iteration/review-sweep-rewrites-its-trigger`:** the model passes it with
      no skill loaded. Two write-the-job pilots also passed unaided (`evals/HISTORY.md`,
      2026-11-23); try one where the trigger is not in the prompt and has to be found.
- [ ] **Cases for the rules added without one.** A prompt with the code or the list inline did not
      work: the model passed five of seven unaided. Build them on a fixture or a longer task:
      asking less in `planning` and `github-issue`; language-model calls in `service-boundaries`;
      API keys in `http-api-design`; a review's proposed fix following the
      owning skill in `agent-workflow`, which a plain request to review a diff loaded in 0 of 3;
      what a test may do in the six skills that gained a scope sentence on 2026-11-23.
      Single-attempt pilots passed unaided for entity references in `http-api-design` and the
      static system prompt in `llm-calls` (`evals/HISTORY.md`, 2026-11-23).
- [ ] **Cases for `github-ci-operations`:** its one case is a ceiling case. Try the small-query
      rules and the backlog order on a task where the agent has to choose what to fetch.
- [ ] **`github-actions-authoring/short-shards-are-merged` loads its skill in 7 of 9,** and
      the model sometimes merges the shards with no skill loaded. Measure the unaided arm with
      more attempts, then decide whether the case needs a harder trap.
- [ ] **Cases built on a fixture** for the merge, close, stack, and readiness rules in
      `pull-requests`. A prompt that lays out the pull request's state gives the answer away.
- [ ] **One full two-arm run** so every row comes from the same run, with more than three attempts
      where a case sits between pass and fail.
- [ ] **Report how often each skill loads** beside its score.
- [ ] **Anchor pattern graders** to the command the agent ran, and split graders that check two
      things.
