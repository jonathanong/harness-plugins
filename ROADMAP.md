# Roadmap

Planned work, most certain first. An item leaves this file when its pull request merges.

## Skills: split

- [ ] `http-api-design` into API shape and secrets, edge, and cache.
- [ ] Move detail to references in `static-code-analysis` and `github-actions-authoring`.

## Skills: add

A skill does not wait for a case the current model fails; weaker models need the rules too.
Each still gets a loading case and an answer case.

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
- [ ] **Cases that still load their skill in under eight of eight attempts:**
      `planning/plan-states-before-after` (5 of 8) and
      `static-analysis-checklist/tracked-files-only` (6 of 8).
- [ ] **`list-reads/review-feed-candidate-pool` loads its skill in 3 of 6.** Find a description
      that loads for a plain review of a feed query, and add a case for writing a list endpoint.
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
