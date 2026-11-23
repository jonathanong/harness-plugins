---
description: A review of a pull request titled as a test-only reliability fix calls out the retry, the raised timeout, the sequential suite, and the production change as things that are not a flake fix.
tags: [test-authoring, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

can you review this before i merge? title is "test: make checkout tests reliable (test-only)". the invoice tests have been failing about 1 in 15 runs in CI and this got 40 green runs in a row.

```diff
diff --git a/vitest.config.ts b/vitest.config.ts
--- a/vitest.config.ts
+++ b/vitest.config.ts
@@ -6,7 +6,8 @@ export default defineConfig({
   test: {
     include: ["src/**/*.test.ts"],
-    testTimeout: 5_000,
+    testTimeout: 30_000,
+    retry: 2,
     setupFiles: ["./test/setup.ts"],
   },
 });
diff --git a/src/checkout/invoice.test.ts b/src/checkout/invoice.test.ts
--- a/src/checkout/invoice.test.ts
+++ b/src/checkout/invoice.test.ts
@@ -9,7 +9,7 @@ import { createInvoice, nextInvoiceNumber } from "./invoice";

-describe("invoice numbering", () => {
+describe.sequential("invoice numbering", () => {
   it("gives each invoice the next number", async () => {
     const a = await createInvoice(db, { accountId });
     const b = await createInvoice(db, { accountId });
diff --git a/src/checkout/invoice.ts b/src/checkout/invoice.ts
--- a/src/checkout/invoice.ts
+++ b/src/checkout/invoice.ts
@@ -21,7 +21,7 @@ export async function nextInvoiceNumber(db: Db, accountId: string) {
   const row = await db.one(
-    "select coalesce(max(number), 0) + 1 as next from invoices where account_id = $1",
+    "select coalesce(max(number), 0) + 1 as next from invoices where account_id = $1 for update",
     [accountId],
   );
   return row.next;
```

Reply in your message; you don't need to create files.
