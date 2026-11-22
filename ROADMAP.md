# Roadmap

Planned work, most certain first. An item leaves this file when its pull request merges.

## Skills: split

- [ ] `bounded-iteration` into sweeps and list reads.
- [ ] `http-api-design` into API shape and secrets, edge, and cache.
- [ ] Move detail to references in `glide-mq`, `evals`, `dependabot`, `static-code-analysis`, and
      `github-actions-authoring`.

## Skills: add

Each is added only when a case shows the model fails without it.

- [ ] Debugging to a root cause before fixing.
- [ ] Verifying a claim before reporting it done.
- [ ] Resuming work after an interruption.
- [ ] Expand-and-contract migrations.
- [ ] Coordinating several agents: who owns what, and where to route work.
- [ ] Security review, performance measurement, incident response, release notes.

## Evals

- [ ] **Replace cases the model passes unaided.** [evals/EVALS.md](evals/EVALS.md) lists them:
      every row with 1.00 in "Without plugin" that is not a guard.
- [ ] **A case that shows each skill helps** for `postgres-schema-design`, `review-ci-logs`, and
      `package-json-checklist`.
- [ ] **Fix cases that load their skill in under half of attempts:**
      `static-analysis-checklist/tracked-files-only`,
      `bounded-iteration/review-sweep-rewrites-its-trigger`, `planning/plan-states-before-after`,
      and `service-boundaries/topology-in-app-repo`. Measure loading with eight attempts.
- [ ] **Cases for the rules added without one:** asking less in `planning`, `github-issue`, and
      `revisit-followups`; language-model calls in `service-boundaries`; handler order and API
      keys in `http-api-design`.
- [ ] **Cases built on a fixture** for the merge, close, stack, and readiness rules in
      `pull-requests`. A prompt that lays out the pull request's state gives the answer away.
- [ ] **One full two-arm run** so every row comes from the same run, with more than three attempts
      where a case sits between pass and fail.
- [ ] **Report how often each skill loads** beside its score.
- [ ] **Anchor pattern graders** to the command the agent ran, and split graders that check two
      things.
