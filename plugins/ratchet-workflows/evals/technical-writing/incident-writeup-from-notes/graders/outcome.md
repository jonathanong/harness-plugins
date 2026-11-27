---
type: llm
---

Judge the Markdown document in the final reply. PASS only if all four hold.

1. It opens with a summary, before any timeline or detail, that states what happened, who was
   affected, and what is still open.
2. It separates what the support lead needs from what the engineers need: sections, or labels on
   sections, that name each audience.
3. It presents both unchecked claims as unverified, not as fact: that most affected customers
   were on iOS, and whether anyone was charged twice. Writing either as a finding fails.
4. The SQL queries the numbers came from appear in an evidence, facts, or appendix section after
   the main content, not only inline in the summary or timeline.

FAIL if any one is missing.
