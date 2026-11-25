---
name: agent-workflow
description: Use when starting an implementation task, working unattended, deciding whether to ask the person or go ahead, writing a status or handoff note, or reviewing a change. Carries a repository change from start to handoff - implement it, decide without stalling, gather evidence, and review a diff. For an open pull request and its review comments, use pull-requests.
---

# Agent workflow

Read every applicable `AGENTS.md` first, from the repository root down to the files being
changed. Repository-local policy overrides these defaults. It owns branches, worktrees, the
review system, and merge policy.

Look at the checkout before starting, without discarding anything in it. Keep the scope explicit:
a blocker or a follow-up found on the way does not widen the task.

## Implement

- Before fixing code, find out why it exists: its history, callers, tests, and linked issues. A
  fix that ignores the original purpose breaks it or patches a symptom.
- If the code no longer serves a purpose, delete it with its tests, configuration, and docs
  instead of fixing it.
- Start from a failing test of the behavior when one can be written. Finish the real path. Do not
  leave a placeholder, a compatibility shim nobody asked for, or a production branch that exists
  for a test.
- When behavior changes, change the public contract, docs, fixtures, and generated artifacts that
  describe it in the same change.
- Removing a timeout or an abort bound needs a replacement on the same path, or a test showing
  every caller supplies its own.
- When changing one row of a policy table, read the sibling rows for a convention it now breaks.

## Before handoff

- Map each acceptance criterion to a focused test, an inspection, or a manual check with a
  concrete result. A skipped check is a finding: say what blocked it and what risk remains.
- When one defect is found, search sibling call sites and write sites for the same shape. Say why
  the remaining matches are safe.
- Compare the final diff with what was agreed. Check that docs, generated output, and public
  contracts agree with the code.
- Report the validation that actually ran, the open pull requests, and what is still blocked.
  What a pull request needs before it is handed off, and how to answer its review comments, is
  in the `pull-requests` skill.
- Keep large logs out of the conversation. Report bounded findings and their evidence.

## Verify a finding

Verify a finding before presenting it or fixing it, whether it comes from a reviewer, a bot, a
note, or your own review. Verified means you reproduced it, traced it in the code, or saw it in
staging or production data where that is available and relevant. For a race, name the two
callers and show they can run at the same time. A finding you traced and found false gets a
reply with the reason and no code change. A finding you cannot verify is reported as unverified.
Do not propose a fix for an unverified claim: a fix for a problem that cannot happen is
unreachable code.

## Review a change

Review the whole diff, not only the changed lines of implementation. Check the premise and scope,
compatibility of public contracts, failure paths, authorization, untrusted input, and secrets.
Ask for dead paths and stale docs to be removed, not labeled legacy. Check the pull request
description against the final behavior.

A fix or a test that a finding proposes follows the same rules as the code under review. Before
suggesting one, check it against the skill or the repository rule that owns that area: a logging
fix against the logging rules, a locking fix against the locking rules, a new test against the
test rules. An author applies a reviewer's suggestion as written, so a suggestion that breaks a
rule puts the defect in with a reviewer's approval on it.

A skill's rules are written for production code unless the skill says otherwise. Do not hold a
test, a fixture, or a seed to a runtime rule: a race test may take a lock, and a fixture may
loop over single inserts. Rules about secrets and personal data, and rules that name tests,
still apply there.

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
- Write for the reader. A pull request is read by an engineer, and that engineer must be able to
  explain from it what the change does for users and for the business. For a document with
  several kinds of reader, use `technical-writing`.
- A review finding says what goes wrong, for whom, and when. A finding that changes nothing for
  anyone is a nit; label it one.

## Decide, then report

Every question stops the work until a person answers. Ask only when the answer cannot be
worked out and a wrong guess cannot be undone.

- When repository policy, the request, or the evidence settles a choice, take it and say which
  one you took. A minor upgrade the policy allows, a missing index, a rebase, a stale branch to
  delete: these are not questions.
- When a choice is open but reversible, take the smallest option, record it as an assumption in
  the handoff, and continue.
- Ask before an action that is destructive or irreversible, that ships a release or spends
  money, or that is outside what was authorized. Recommend one option with the reason; do not
  list options. Ask every open question at once, and keep working on what does not depend on the
  answers.
- Filing an issue, opening a pull request, and messaging an owner are ordinary steps wherever
  the repository allows them. Being public does not make them questions.
- An instruction given once stands. Do not ask again for approval already given.
- Work that belongs to another owner or agent goes to them, in one message they can act on
  without this conversation. Do not bring it to the person, and do not do it yourself.
- Use the tool built for a job, such as the repository's pull request tool for waiting on checks,
  before writing a polling loop or a watcher script.
- A handoff lists as "needs you" only what a person alone can do. Anything else on that list is
  unfinished work.

## Parallel by default

Split the work into independent units and run them at the same time, one worker and one worktree
each, within any limit the person set. Make a unit wait only for a named dependency:

- it needs an upstream change that is not released yet
- it changes the same files or contract as another unit; stack those instead of waiting (see
  the `pull-requests` skill)
- it would write in the same worktree

A pull request that is waiting on review or checks does not pause the other units.
