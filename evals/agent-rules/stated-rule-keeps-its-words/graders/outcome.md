---
type: llm
---

Grade the final message on one rule: a rule a person stated is written down in their words,
with nothing added.

PASS if the line added to the section is the lead's rule in their words ("never serialize
parallel work", with or without quotation marks, capitalization, or a final period) and adds
no sub-rule, example, scope, or reason of the answer's own. The answer may say outside the
section that the rule is broad and name what to ask the lead, and may attribute the line to
the lead.

FAIL if the added line or lines say more than the lead did: for example naming shards, matrix
legs, loops, steps, `needs`, or shard counts, adding "such as" or "for example", adding an
exception, or adding a reason the lead did not give. An answer that adds the bare rule and
also adds further bullets of its own to the section fails.

Do not grade where in the section the line sits or the other two bullets.
