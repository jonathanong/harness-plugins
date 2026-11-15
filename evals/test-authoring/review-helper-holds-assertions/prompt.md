---
description: A review of new tests flags an expected value recomputed with the production formula and assertions hidden in a helper.
tags: [test-authoring, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff. `prorate` is our billing proration; it already exists and is not part of the diff.

```diff
+import { describe, expect, it } from 'vitest'
+import { prorate } from './prorate'
+
+function expectValidProration(result: { chargeCents: number; creditCents: number }, amount: number) {
+  expect(result.chargeCents).toBeLessThanOrEqual(amount)
+  expect(result.chargeCents + result.creditCents).toBe(amount)
+}
+
+describe('prorate', () => {
+  it('charges for the days used', () => {
+    const amount = 2999
+    const daysUsed = 11
+    const daysInPeriod = 30
+    const expected = Math.round((amount * daysUsed) / daysInPeriod)
+
+    const result = prorate(amount, daysUsed, daysInPeriod)
+
+    expect(result.chargeCents).toBe(expected)
+    expectValidProration(result, amount)
+  })
+
+  it('charges everything for a full period', () => {
+    const result = prorate(2999, 30, 30)
+    expectValidProration(result, 2999)
+  })
+
+  it('charges nothing for zero days', () => {
+    const result = prorate(2999, 0, 30)
+    expectValidProration(result, 2999)
+  })
+})
```

Reply in your message; you don't need to create files.
