---
description: Guard. Checkout code that must never oversell keeps stock exact without an unbounded lock, and enqueues its jobs after commit.
tags: [postgres-locking, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We oversold a few products during a launch, so checkout has to stop that. Write `placeOrder(pool, cartId)` for PostgreSQL 17 and Node with `pg`. It loads the cart's items (`loadCartItems(client, cartId)` returns `{ sku, qty }[]`), takes each item's quantity out of `stock (sku text primary key, qty int not null)`, throws `OutOfStockError` if any item is short, inserts the order with `insertOrder(client, cartId, items)`, and then queues a `send-receipt` job on the BullMQ queue `receipts` and a `reserve-shelf` job on the queue `warehouse`. Launch traffic sends hundreds of checkouts a second at the same few products. Reply in your message; you don't need to create files.
