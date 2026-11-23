# Roadmap

Planned work, most certain first. An item leaves this file when its pull request merges.

## Skills: split

- [ ] Move detail to references in `static-code-analysis` and `github-actions-authoring`.

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
- [ ] **`list-reads/review-feed-candidate-pool` loads its skill in 3 of 6.** Find a description
      that loads for a plain review of a feed query, and add a case for writing a list endpoint.
- [ ] **The pagination rules need a server-side case and a native case.** Add a `list-reads`
      case where a capped walk must set `has_next_page` on an empty page, and a
      `native-app-architecture` case for the client rule.
      `react-app-structure/load-more-follows-the-flag` loads its skill in 9 of 12 attempts.
- [ ] **`test-authoring` does not load for a review of a de-flake diff.** Its flake-fix section
      is read only when something else loads the skill. Two wordings that named retries,
      timeouts, and skips fixed that and may have cost loads on `review-direct-row-inserts` (9
      of 12 against 6 of 6). Measure both descriptions at about twelve attempts per case, and
      write a case for it that the model fails unaided; the drafted one, described in
      `evals/HISTORY.md`, passed without the skill. `dotnet-private-field-not-reflected` also
      loads in only 7 of 12.
- [ ] **`dependabot` needs a repair case the model fails unaided.** `repair-pr-with-pushed-fix`
      is a ceiling case. Try a fixture where the commits are not in the prompt and the agent has
      to read them before it comments.
- [ ] **`git-commit-checklist` needs a generated-file conflict the model fails unaided.**
      `generated-file-conflict-on-rebase` is a ceiling case. Try a fixture where the generator
      command is not in the file's header, or the conflict is in a generated project file.
- [ ] **`llm-calls` needs a case the model fails unaided.** Its one case is a ceiling case.
      Candidates: a model id defaulted in code, and a tool that trusts a model-supplied limit.
- [ ] **`agent-coordination` loads in 0 of 3** on a request to act on another agent's message.
      Its case and those of `expand-contract-migrations` and `resuming-work` pass unaided; each
      needs a fixture-based case.
- [ ] **`debugging` and `verification` load in 1 of 6 and their cases pass unaided.** Build each a
      case on a fixture repository with a real failing command, where the tempting fix is wrong,
      and measure loading there.
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
