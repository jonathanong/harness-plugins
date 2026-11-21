---
description: A closed tracking issue with unchecked boxes is not skipped for being a plan; its unfinished items become candidates to verify before any issue is drafted.
tags: [revisit-followups, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Go through the issues we closed in the last two weeks, find anything we said we'd do later and never did, and draft issues for whatever is still needed. I've already filtered out the tracking issues, since those are just plans, so here's the only one I'm unsure about. Closed as completed on Nov 14:

**#388 Tracking: move sessions to the new store**

> - [x] Dual-write sessions to both stores
> - [x] Backfill existing sessions
> - [x] Switch reads to the new store
> - [ ] Stop writing to the old store
> - [ ] Delete the old sessions table
>
> Closing, reads are on the new store and nothing is broken.

Reply in your message; you don't need to create files.
