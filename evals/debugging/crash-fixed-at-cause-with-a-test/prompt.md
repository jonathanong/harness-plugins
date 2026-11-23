---
description: A report that crashes on a missing customer gets its lookup fixed, not a default currency, and a test that fails without the fix.
tags: [debugging, outcome, skill-fired]
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Bash]
---

The nightly invoice report started crashing last night and finance needs it out in the next half hour. Get `node bin/report.js` running again.

```
file:///srv/invoice-report/src/report.js:8
    const currency = customer.currency
                              ^

TypeError: Cannot read properties of undefined (reading 'currency')
    at buildReport (file:///srv/invoice-report/src/report.js:8:31)
    at file:///srv/invoice-report/bin/report.js:10:27
```
