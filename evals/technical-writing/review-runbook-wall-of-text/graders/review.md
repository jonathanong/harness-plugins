---
type: llm
---

PASS only if the review raises all three of these.

1. Structure: the runbook is one paragraph, and the action an on-call engineer needs is buried in
   it. The review asks for the action or decision up front and the steps as an ordered list, with
   the DLQ check before the restart made explicit as a step or condition.
2. Jargon: "reaper", "DLQ", and "RPO" are used without definition. The review asks for them to
   be defined at first use, linked, or put in a glossary. Naming at least two of the three passes.
3. Changing numbers: the runbook states figures that drift, such as 1.2 million jobs a day and a
   p95 wait of 340 ms. The review asks to remove them or replace them with how to get the current
   value, such as a query, command, or dashboard link.

FAIL if any one is missing, or if the review approves the runbook as is.
