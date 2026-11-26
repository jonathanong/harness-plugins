---
description: Sending a fix upstream from a fork fills in the project's pull request template and opens a pull request in the fork as well.
tags: [upstream-contributions, skill-fired]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

The retry fix is committed on `fix-retry-after-header` and pushed to our fork (`origin`). Send
it upstream to `tidewater-labs/httpkit` (`upstream`). It closes their issue 412. I added two
tests, `make check` passes locally (ran it after the last commit), and I have not written a
changelog entry. I can't give this session GitHub access, so give me the exact commands to run
and the full pull request body.
