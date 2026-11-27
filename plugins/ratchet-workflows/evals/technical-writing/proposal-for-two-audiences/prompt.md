---
description: A proposal for leadership and engineers names each section's audience, tables every flag-and-plan combination and the before and after, and defines its jargon.
tags: [technical-writing, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Draft a proposal I can send to leadership and to the platform team. We want image uploads to go straight from the browser to S3 with presigned URLs instead of through our API servers. Today every upload streams through the API, uploads over about 50 MB time out, and upload traffic is a big part of our API bandwidth bill. The change ships behind a flag, `direct_uploads`, turned on for the free plan first and the paid plans a week later. With the flag off, uploads keep going through the API. Leadership has to approve the rollout dates; the platform team has to build it.

Write it in Markdown. Reply in your message; you don't need to create files.
