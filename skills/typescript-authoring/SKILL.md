---
name: typescript-authoring
description: Keep TypeScript and Node.js code direct - no forwarding aliases, shims, or dynamic dispatch - with errors handled where thrown, one batch call for per-item I/O, and packages that respect layer and runtime boundaries. Use when writing or reviewing TypeScript or Node.js code, especially renames, async errors, loops that query or enqueue, bulk paths, and HTTP calls.
---

# TypeScript authoring

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

The common thread: a reader, or a tool, should be able to follow a name to the one place it is
defined and to every place it is used.

## One name per thing

- Do not add a const alias, a function alias, an export rename, a re-export, or a shim whose only
  job is to forward to another symbol. Use the original and update the callers.
- When something is renamed or moved, change every caller in the same change. Do not leave the
  old path in place "for compatibility" inside one codebase. Two names for one thing double what
  a search returns and hide which is current.
- A published package with outside consumers is the exception. Keep the old name for a stated
  deprecation window, and say when it goes.

## No dead surface

Do not export a placeholder type, an error class nothing throws, an empty file, or code no
entry point reaches. Add the export in the change that first uses it.

## Call the target by name

Do not hide a call behind a computed property key, a runtime registry, or a lambda that only
forwards its arguments.

```ts
// Avoid: the callee is data.
handlers[`on${kind}`](event)

// Prefer: every call site names its callee.
switch (kind) {
  case 'Created':
    return onCreated(event)
  case 'Deleted':
    return onDeleted(event)
}
```

A direct call can be found, renamed, and type-checked. A dispatched one is found only by running
the code.

## Async errors

Inside a `try` whose `catch` should handle the failure, write `return await promise`. A bare
`return promise` leaves the `try` before the promise settles, so the rejection skips the `catch`
and the `finally` runs early.

## Boundaries

- Where the codebase has a transport helper that owns auth, retries, timeouts, and policy, call
  it. Do not call global `fetch` beside it; that request silently skips all of those.
- Respect one-way layers. Server code does not import from client code or the reverse, and a
  queue producer does not import a worker. Share types through a module both sides may import.
- A package meant for more than one runtime (Node, browsers, edge workers) does not import
  Node-only APIs. Take them as injected dependencies.
- A shared package holds mechanism, not product policy. Pass limits, feature rules, and tenant
  decisions in from the application.

## Batch first, single item second

A function that does I/O per item (a database read or write, an enqueue, an outbound API call)
takes a list and makes one round trip for the whole batch. The single-item form is a thin
wrapper that calls the batch function with a one-element list, so there is one code path.
Loops, `.map` callbacks, and `Promise.all` fan-outs call the batch function, never the
single-item form N times.

```ts
// One round trip for N jobs; the single form only wraps it.
export const enqueueReceipts = (orderIds: string[]) =>
  queue.addBulk(orderIds.map((id) => ({ name: 'receipt', data: { id }, opts: { jobId: id } })))
export const enqueueReceipt = (orderId: string) => enqueueReceipts([orderId])
```

The batch must give a one-item list the same semantics as the single call. For the SQL shape
and its caveats, see
[round trips](../postgres-node-performance-tuning/references/performance-patterns.md#round-trips).

## Embedded scripts

Keep a multi-line script in another language (Lua, SQL, shell) in its own file and load it. A
script inside a string literal gets no syntax highlighting, no linting, and no test of its own.

## Comments

For what a code comment should and should not say, use `documentation`.
