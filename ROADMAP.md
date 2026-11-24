# Roadmap

Planned work, most certain first. An item leaves this file when its pull request merges.

## Skills: add

A skill does not wait for a case the current model fails; weaker models need the rules too.
Each still gets a loading case and an answer case.

- [ ] Security review, performance measurement, incident response, release notes.

## Evals

- [ ] **Replace cases the model passes unaided.** [evals/EVALS.md](evals/EVALS.md) lists them:
      every row with 1.00 in "Without plugin" that is not a guard.
- [ ] **`review-ci-logs/first-error-in-a-long-log` loads its skill in 6 of 9 attempts** after
      its description named the request (`evals/HISTORY.md`, 2026-11-24), and the model
      passes its answer unaided. It needs a log where the first cause is harder to find.
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
- [ ] **A `bounded-iteration` case for a sweep that re-selects its own writes, that the model
      fails unaided.** `review-sweep-whose-trigger-is-elsewhere` loads the skill but passes
      without it in 8 of 12 attempts (`evals/HISTORY.md`, 2026-11-24). Two write-the-job pilots
      also passed unaided (2026-11-23).
- [ ] **Cases for the rules added without one.** A prompt with the code or the list inline did not
      work: the model passed five of seven unaided. Build them on a fixture or a longer task:
      asking less in `planning` and `github-issue`; language-model calls in `service-boundaries`;
      API keys in `http-api-design`; a review's proposed fix following the
      owning skill in `agent-workflow`, which a plain request to review a diff loaded in 0 of 3;
      what a test may do in the six skills that gained a scope sentence on 2026-11-23.
      Single-attempt pilots passed unaided for entity references in `http-api-design` and the
      static system prompt in `llm-calls` (`evals/HISTORY.md`, 2026-11-23).
- [ ] **Skills that give way to a request by name.** Three rules did on 2026-11-23: asked
      for an override, a polling loop, or a whole run's log, an answer that loaded the skill
      gave the thing anyway. Try the same kind of request on other skills' "do not" rules.
- [ ] **Cases built on a fixture** for the merge, close, stack, and readiness rules in
      `pull-requests`. A prompt that lays out the pull request's state gives the answer away.
- [ ] **Skills that do not load for a one-edit request.** On 2026-11-23 a request to add
      one block or change one call, with the code pasted in, loaded `structured-logging` in
      0 of 3 and `github-actions-authoring` in 2 of 9 until their descriptions named the
      request. Try such prompts on other skills.
- [ ] **The two shard cases in `github-actions-authoring` load unevenly.** On 2026-11-24
      `working-shards-stay-parallel` loaded the skill in 1 of 3, 2 of 3 and 6 of 6 across runs
      and `short-shards-are-merged` in 1 of 3; every loaded answer passed.
- [ ] **Candidate rules from an incident review, each needing a case first:** a CI change is
      validated by a run that exercises the changed path; a feature pull request's body is
      rewritten whole after revisions; before
      handoff, run the change on its most common input and call a self-defeating result a
      bug; a spec's constraints cover every surface the change affects.
- [ ] **Candidate rules from a review of one orchestrator's logs on 2026-11-24, each needing a
      case first.** They are a review agent's wording, not the owner's.
      `agent-rules`: keep one current rule per topic and delete what it replaced (the other
      candidate, a stated rule keeps its words, is in the skill with a case).
      `resuming-work`: a scheduled or repeating prompt is as old as the day it was written,
      and every standing copy changes when the instruction does; after a context summary,
      re-read the standing notes before acting on a limit, hold, or approval it states.
      `agent-workflow`: a yes covers the action that was asked about, not a wider or permanent
      mechanism; raise a pending question once, and check the actual condition before
      flagging an item. `agent-coordination`: read the preferred workers' availability from
      the live source before using a fallback; read the change behind a worker's numbers
      before relaying them as a trade-off.
- [ ] **A guard needs a reachable race.** Proposed after the same incident as the
      `github-issue` investigation rule: before adding a guard, a conditional write, or a race
      test for a concurrency finding, name the two callers and show they can run at the same
      time, checking what already serializes them. The cursor part is settled another way:
      `bounded-iteration` now gives each run its own position, so there is no shared cursor to
      guard. The general rule for other guards still needs the owner's word and a case.
- [ ] **A sweep that must not overlap and has a deadline.** `bounded-iteration` says what to do
      when nothing needs a run to finish by a set time. The owner has not said what to do when
      something does.
- [ ] **One full two-arm run** so every row comes from the same run, with more than three attempts
      where a case sits between pass and fail.
- [ ] **Report how often each skill loads** beside its score.
- [ ] **Anchor pattern graders** to the command the agent ran, and split graders that check two
      things.
