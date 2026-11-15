---
description: A round of review comments gets one disposition per item and one push, not a fix for every comment.
tags: [agent-workflow, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

My PR adds `POST /teams/:id/invites`. CI is green. We have no job queue in this repo yet. These four review comments came in; I've checked each against the code and the facts in them are right, except where I say otherwise. Tell me what to do with each one and in what order, then I'll do it.

1. **review-bot** on `invites.ts:41`: "`createInvite` does not check that the caller is a member of the team in `:id`. Any signed-in user can invite into any team."
2. **review-bot** on `invites.ts:12`: "Consider renaming `inv` to `invite` for readability."
3. **review-bot** on `invites.ts:58`: "The invite email is sent inline in the request. If the mail provider is slow this handler will be slow. Consider moving it to a background job."
4. **dana** (teammate) on `invites.test.ts:20`: "This doesn't cover an expired invite." (It does: the test at line 74 of the same file creates an expired invite and asserts it is rejected.)

Reply in your message; you don't need to create files.
