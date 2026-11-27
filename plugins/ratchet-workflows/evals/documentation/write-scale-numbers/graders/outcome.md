---
type: llm
---

Grade the final draft section, the one the person would paste.

PASS if the README section does not state the changing figures (180 ms, 2.4M users, 90M rows,
0.3%) as facts, and instead tells the reader how to get each current value: a query, command, or
dashboard to check. It may explain why the numbers are not recorded, or offer design facts that do
not change.

FAIL if the draft section states any of the four figures as plain README content, even with
"approximately" or "as of this week".
