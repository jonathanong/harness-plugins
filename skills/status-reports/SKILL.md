---
name: status-reports
description: Use when writing a status note, summary, end-of-day update, or handoff, before saying a task is done, fixed, passing, deployed, or merged, and when asked "did it work?" or "are we good to merge?". Back each claim with something observed in this session, say who a change affects and how, list for the person only what they alone can do, and mark who made each decision.
---

# Status reports

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

A reader acts on your report without redoing the work. A claim that was never checked becomes
their bug.

## Back each claim

- Back every claim with something you observed in this session: the command you ran and its
  result. "Should work" and "it looks right" are not results.
- Run the check that matches the claim. Tests for "tests pass", the real behavior for "it
  works", the remote state for "pushed", "merged", or "deployed". A build or typecheck passing
  shows the code compiles, not that it behaves.
- Re-run after the last change. A result from before a later edit says nothing about the code
  now, even if the edit was one line.
- Read the exit code and the output together. A command that printed errors and exited 0, or
  whose exit code a pipe hid, has not passed.
- Do not repeat a subagent's or a tool's summary as fact. Check the artifact it points to: the
  diff, the test output, the actual state.

## Report

- List what was verified, with the command and result, apart from what was not, with the reason.
  Do not blend them into one confident sentence.
- Report a failure or a skipped step with its output. Never round a partial result up: "41 of 42
  passed" is not "tests pass".
- When a check cannot be run (no access, too costly, too slow), say so and name the check the
  reader should run.

Example:

> Verified: `pnpm test` passed (42 of 42) after the last edit. Not verified: the export against
> the real database, which I cannot reach; run `pnpm run export --dry-run` on staging.

## What the note asks

- A handoff lists as "needs you" only what a person alone can do. Anything else on that list is
  unfinished work: do it, or send it to its owner.
- Which choices to take yourself and which to ask about is in the `agent-workflow` skill, under
  "Decide, then report". Ask about an action that is destructive, irreversible, or outside what
  was authorized, with one recommendation and its reason.

## Explain the outcome

Everything you write about a change says who it affects and what changes for them: a plan, an
explanation of a problem or a fix, a pull request description, a review finding, a status note.
"Adds a lock" or "fixes a race" is the mechanism. The outcome is what users, customers,
operators, or the business see, wait for, pay, lose, or can now do.

- Name the people affected and the effect in their terms: "two shoppers can no longer both buy
  the last unit", "each checkout can wait up to two seconds behind a stock update", "the report
  loads in 1 s instead of 8".
- When a change trades one effect for another, state both. A lock prevents a wrong result and
  adds a wait to every request that queues on it.
- When nobody outside the team is affected, as with a refactor or a CI change, say that users
  see no change and name who is affected: the engineers waiting on CI, the on-call reading an
  alert. Do not invent an effect on users.
- A review finding follows the same rule; see the `change-review` skill.
- Write for the reader. A pull request is read by an engineer, and that engineer must be able to
  explain from it what the change does for users and for the business. For a document with
  several kinds of reader, use `technical-writing`.

## Record who decided

Mark which decisions the person in the session made and which you made, so a reader can tell a
confirmed choice from your own call, and push back on yours.

- Record a decision the person could have been expected to make: a scope cut or addition, a
  design choice, a trade-off, a default the request left open, anything costly to reverse, and
  the answer to any non-trivial question you asked; not what the code or a rule settled.
- Record it where the work is tracked: a pull request description, an issue description, a
  comment on either, and an implementation plan for the team doing the work. Use a short
  "Decisions" list; start each line with **User:** or **Agent:**, and give an agent decision its
  reason. Paraphrase the person; do not quote or name them.

  ```markdown
  - User: keep `/v1/orders` until the mobile app's 4.2 release ships.
  - Agent: a 5-second timeout on the tax call; the request set none and its p99 is 800 ms.
  ```

- **User** is only the person in this session. Another agent, a bot, or a peer session is not;
  a suggestion from one that you adopted is your decision. Leave agent-to-agent exchanges out.
- Leave attribution out of long-lived documentation: a README, a docs page, a code comment, a
  commit message, and a roadmap for a wider organization. What those hold is taken as decided;
  attribution there is noise. Add it only when the person asks.
