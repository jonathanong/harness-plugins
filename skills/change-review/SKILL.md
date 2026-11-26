---
name: change-review
description: Use when asked to review a diff, a change, a pull request, or a file, or when handed a finding from a reviewer, a bot, or a note to act on. Verify each finding before reporting or fixing it, review the whole change, check a proposed fix against the rules that own its area, and say what each finding does to the people affected.
---

# Reviewing a change

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults. It
owns the review system and merge policy.

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

## Write the finding

- A finding says what goes wrong, for whom, and when, in terms of the people affected: "a
  shopper can be charged twice", not "the retry is not idempotent". How to state an outcome is
  in the `status-reports` skill, under "Explain the outcome".
- When the change trades one effect for another, state both: a retry hides a failure and makes
  every caller wait longer.
- A finding that changes nothing for anyone is a nit; label it one.

For answering review comments on an open pull request, use the `pull-requests` skill.
