---
description: Asked to fix one crash, fixes or reports the sibling call sites with the same shape and says why the remaining match is safe.
tags: [implementing-changes, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Fix this bug. Sentry shows `TypeError: Cannot read properties of null (reading 'toLowerCase')`
in `findByEmail`, for accounts created through SSO, which have no email until the user adds one.

`src/users/service.ts`:

```ts
import { db } from '../db'
import { mailer } from '../mailer'

export type User = { id: string; email: string | null; name: string }

export async function findByEmail(users: User[], email: string) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

export async function sendReceipt(user: User, orderId: string) {
  await mailer.send({ to: user.email.toLowerCase(), template: 'receipt', orderId })
}

export async function mergeAccounts(keep: User, drop: User) {
  if (keep.email.toLowerCase() !== drop.email.toLowerCase()) {
    throw new Error('accounts have different emails')
  }
  await db.query('UPDATE orders SET user_id = $1 WHERE user_id = $2', [keep.id, drop.id])
}

export function displayEmail(user: User) {
  return user.email ? user.email.toLowerCase() : 'no email on file'
}
```

Reply with the change in your message; you don't need to create files.
