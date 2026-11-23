---
name: error-handling
description: Use when writing or reviewing code that throws, catches, or matches an error, turns a failure into a response, or reports errors to a tracker such as Sentry, including a review of a diff that does. Covers one defined list of error codes, matching on type or code instead of message, details as attributes on the error, and reporting only errors someone can act on.
---

# Error handling

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

An error has three readers: the code that catches it, the client that shows it, and the person
who is paged for it. Each needs something other than a sentence to parse.

For the log line that records an error, use `structured-logging`. For where a handler maps an
error to a response, use `http-api-design`.

## Codes from one list

- Give every error that a caller, a client, or an alert may branch on a code, and define every
  code in one list: an enum, a union type, or a constant set. Type the field so that a code
  outside the list does not compile or fails a check.
- A free string drifts: `not_found` in one place and `NotFound` in another. One list can be
  searched, documented for clients, and switched over exhaustively.
- A code is a contract. Add a code; do not rename or reuse one that clients or alerts already
  match. The message stays free to change.
- Send the code to the client as its own field, beside the message.

```ts
export const ERROR_CODES = ['order_not_found', 'refund_exceeds_total', 'payments_down'] as const
export type ErrorCode = (typeof ERROR_CODES)[number]

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly status: number,
    readonly details: Record<string, unknown> = {},
    options?: ErrorOptions,
  ) {
    super(code, options)
  }
}
```

## Match on type or code, not message

Decide what an error is from its class or type, or from its code. Do not search its message.

```ts
// Avoid: breaks when the sentence is reworded, translated, or changed by an upgrade.
if (err.message.includes('duplicate key')) return conflict()

// Prefer
if (err instanceof DatabaseError && err.code === '23505') return conflict()
```

- A message is written for a person, and nothing stops the next edit from changing it. A
  class or a code is something a compiler or a search can follow.
- This holds on both sides of a boundary: a client branches on the code field in the response,
  and a test asserts on the class or code that was thrown.
- Where a library gives only a message, match it in one place and convert it there to an error
  of your own with a code, keeping the original as the cause. The string match then lives in
  one function instead of every caller.

## Details are attributes

Put what a reader needs about the failure on the error as attributes: the code, the ids
involved, the limit and the value that broke it, an upstream status. Keep the message a fixed
string.

```ts
// Avoid: the ids exist only inside a sentence.
throw new Error(`Refund ${amount} exceeds total for order ${orderId}`)

// Prefer
throw new AppError('refund_exceeds_total', 422, { orderId, amount, total })
```

- A handler, a log line, and an error tracker can read an attribute. They would have to parse
  a sentence.
- A tracker groups by message. A fixed message is one issue; an interpolated one is a new
  issue for every id.
- Attributes travel to the response, the logs, and the tracker. Do not put a secret on an
  error, and choose which attributes a client may see.

## Report what someone can act on

Send an error to the error tracker (Sentry or a similar tool) when a person on the team can do
something about it: a bug, an unexpected state, a dependency that failed, a 5xx.

- Do not report an outcome the code expects: failed validation, a missing or forbidden
  resource, a conflict, a rate limit, a request the client cancelled. These are the 4xx
  responses. A tracker full of callers' mistakes gets muted, and the real failure is then
  missed. Count them with a metric or a log line instead.
- Decide from the class or code in one place, such as the HTTP error handler or the job
  runner, so that a new expected error is not reported by default at each `catch`.
- Pass the error object itself, so the tracker keeps the stack and the cause, and pass its
  attributes as structured context, with the code as a tag that issues can be filtered by.
- A 4xx that your service receives from a service it calls is often your bug, because your
  request was wrong. Report that one. The rule is about what your service answers, not what it
  is told.

```ts
const known = err instanceof AppError ? err : null
if (!known || known.status >= 500) {
  tracker.captureException(err, { tags: { code: known?.code }, extra: known?.details })
}
```
