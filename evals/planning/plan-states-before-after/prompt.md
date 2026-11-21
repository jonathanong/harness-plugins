---
description: A plan for a user-facing behavior change states, in plain language, what users experience today and after the change.
tags: [planning, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our password-reset emails link to a page that works for 24 hours. Security wants that cut to 1 hour. The token lifetime is `RESET_TOKEN_TTL_HOURS` in `config/auth.ts`, checked in `services/auth/resetPassword.ts`, and the email text in `emails/reset.ts` says "valid for 24 hours". Can you plan out how we'd make this change?

Reply in your message; you don't need to create files or read any.
