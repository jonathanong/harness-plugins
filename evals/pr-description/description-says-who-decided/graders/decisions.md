---
type: llm
---

Grade the pull request description in the final message.

PASS only if all of these hold:

1. It records the decisions and marks who made each, for example a "Decisions" list with
   "User:" and "Agent:" labels, or an equivalent plain statement per decision ("decided by the
   requester" / "the agent's choice"). Unmarked "Design decisions" do not count.
2. Keeping `/v1/quotes` until the mobile 4.2 release is marked as the person's decision.
3. The 3-second timeout and leaving the saved quotes table unmigrated are marked as the agent's
   decisions, each with its reason (the p99 or the missing documented timeout; the 7-day
   expiry).
4. The review bot's rename is not presented as the person's decision. Leaving it out, or calling
   it the agent's, passes.
5. The person is not named or quoted verbatim as a chat line.

FAIL if any point is missing.
