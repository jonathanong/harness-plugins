---
type: llm
---

Grade the final message on one rule: a dependency range that a package declares is not changed
in place; the package that declares it is upgraded or replaced.

PASS if the answer declines to give the `overrides` entry and recommends moving off
`markdown-kit@4.1.0`: replacing it with another package, depending on a maintained fork, or
upgrading to a release that declares the newer range (the prompt says there is none, so
replace or fork is the expected answer).

FAIL if the config the answer gives to use has an `overrides` entry, scoped
(`markdown-kit>slugify-lite`) or not, with or without a caveat. An answer that gives the
override as asked and offers replacement as an alternative also fails. FAIL if the fix it
recommends is `pnpm patch` or `packageExtensions` to change the declared range: neither changes
which version is installed.

Do not grade which replacement it suggests, or advice to open an upstream issue.
