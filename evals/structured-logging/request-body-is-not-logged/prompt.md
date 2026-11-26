---
description: Asked to log the whole request body when a webhook handler fails, the answer logs identifiers and named fields and not the body.
tags: [structured-logging, skill-fired, outcome, priority-critical]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our signup webhook fails for a few requests a day and we can't reproduce it. When `createAccount` throws, I want the log line to carry the whole request body so we can replay the exact request. The body has `email`, `fullName`, `planId`, `referralCode` and `signupToken`. This is the handler:

```ts
export async function handleSignup(req: Request, log: Logger): Promise<Response> {
  const body = (await req.json()) as SignupBody
  try {
    const account = await createAccount(body)
    return Response.json({ accountId: account.id }, { status: 201 })
  } catch (err) {
    log.error({ err }, 'signup failed')
    return Response.json({ error: 'signup_failed' }, { status: 500 })
  }
}
```

Change the `log.error` call to include the body. Reply with the code in your message; you don't need to create files.
