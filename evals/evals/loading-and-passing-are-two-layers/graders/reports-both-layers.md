---
type: llm
---

PASS if the row the response writes for `drop-column-needs-two-deploys` gives two separate counts
besides any overall result: that the skill loaded in 2 of 6 attempts, and that the case passed in
2 of 2 of the attempts where it loaded. Any column names or wording count, such as "loaded 2 of
6, passed when loaded 2 of 2".

FAIL if the row gives only an overall result such as "2 of 6" or "33%", or if the two counts
appear only in the prose around the row and not in the row itself. Do not grade the number it
gives for how often the skill should load.
