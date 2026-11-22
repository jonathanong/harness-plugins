# Roadmap

Planned work, most certain first. An item leaves this file when its pull request merges.

## Skills: fix what is wrong

- [ ] **Ask less.** Replace "ask the user" with a stated default in `planning`,
      `revisit-followups`, `github-issue`, and `agent-rules`, wherever the answer does not change
      what happens next.
- [ ] **Remove contradictions.** `package-json-checklist` asks for the latest release and
      `dependabot` asks for a cooldown; `github-actions-authoring` says never poll, then lists
      exceptions; `agent-rules` contradicts itself on where a scoped rule lives.
- [ ] **State each rule once.** Rules repeated across `bounded-iteration` and
      `postgres-node-performance-tuning`, `glide-mq` and `bounded-iteration`, and `documentation`,
      `technical-writing`, and `agent-rules` get one owner and a link.
- [ ] **Open every skill with the `AGENTS.md` line**, and make `skill-authoring` state the
      description limit this repository enforces.
- [ ] **Locking:** a dedicated pool for session-level advisory locks, and get-or-create without a
      lock.
- [ ] **Queues are ephemeral.** Failed jobs are not kept as state; recovery reads database rows.

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
- [ ] LLM calls: one call per decision, no default model, untrusted content wrapped.
- [ ] Security review, performance measurement, incident response, release notes.

## Evals

- [ ] **Replace cases the model passes unaided.** [evals/EVALS.md](evals/EVALS.md) lists them:
      every row with 1.00 in "Without plugin" that is not a guard.
- [ ] **A case that shows each skill helps** for `postgres-schema-design`, `review-ci-logs`, and
      `package-json-checklist`.
- [ ] **Cases built on a fixture** for the merge, close, stack, and readiness rules in
      `pull-requests`. A prompt that lays out the pull request's state gives the answer away.
- [ ] **One full two-arm run** so every row comes from the same run, with more than three attempts
      where a case sits between pass and fail.
- [ ] **Report how often each skill loads** beside its score.
- [ ] **Anchor pattern graders** to the command the agent ran, and split graders that check two
      things.
