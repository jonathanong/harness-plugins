---
description: 'Guard: updating a docs page with a decision made in a session states the decision and its reason as fact, with no note of who made it.'
tags: [documentation, guard]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a "Timeouts" section to our `docs/shipping-quotes.md` covering what we settled today: the
new carrier client times out after 3 seconds (their p99 is about 900 ms and their docs give no
timeout), and the old `/v1/quotes` route stays until the mobile 4.2 release ships, which I
decided. Give me the section text in your message; you don't need to create files.
