---
name: test-authoring
description: Use whenever a task writes, reviews, fixes, or deletes an automated test, fixture, mock, or test helper, including a review of a diff that adds tests or changes test retries, timeouts, or skips - Vitest, Jest, backend integration, Next.js, Storybook, Swift, or .NET (xUnit, NUnit). Decides which tests to keep and how each fails for one real reason. Browser tests: also playwright-authoring.
---

# Test authoring

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

A test earns its place when it fails if, and only if, a contract breaks. Most of these rules
remove tests and helpers that cannot do that.

## Which tests to keep

- Keep one failure-sensitive test per contract, at the lowest boundary where the contract is real.
  A second test of the same contract one layer up adds run time and a second place to update.
- Before adding a test, name the change that would make it fail. If an existing test already
  fails for that change, do not add another.
- Test through the public surface. Do not export something from production code only so a test
  can reach it; that export becomes API that nothing else may use and nobody dares remove.
- Do not add a test file that only imports other test files. The runner already finds them, and
  the aggregate hides which file failed.

## Isolation

- A unit test does not bind a port, including port 0, and does not reach a real network service.
  Inject the transport or use an in-memory double. Tests that bind ports collide under parallel
  runs and fail on machines that restrict sockets.
- Put a test that needs a real service in the integration suite, where its setup is explicit.

## Fixtures

- Store fixture files under a fixtures directory and read them in place. Copy them into a
  temporary directory only when the test changes them. Do not create them inline with `writeFile`
  and `mkdir` in the test body. A fixture on disk can be read, diffed, linted, and reused; a tree
  built in code can only be run.
- Build fixture objects through the same public constructors and factories production uses. A
  fixture cast into shape, or built by setting private fields, keeps passing after the real type
  changes.
- Create database rows the same way, through the factories or the code path production writes
  with, so hooks and defaults run. A row inserted directly can hold a state production never
  creates, and the test passes on it. Insert directly only to reach a state production can no
  longer create, such as legacy or half-migrated data, or a precondition a hook would overwrite,
  and say in the test which state it needs.
- Keep a fixture minimal and typed: only the fields this test reads. Cross each boundary with the
  fewest rows: lower the work limit through configuration instead of creating a full page.

## Helpers

- A helper removes setup. It does not hold expectations. Keep every assertion in the test body,
  so a reader sees what is checked and a failure points at the test.
- A helper that needs many options is two helpers.

## Guards that nothing was forgotten

When a test checks that every file, route, or export is covered by something, write it as a
deny-list: enumerate everything, subtract a short list of named exceptions, and assert on the
rest. An allow-list of known items passes silently when someone adds a new one, which is the
case the guard exists for.

## Assertions that can fail

- Before finishing a test, name a defect in the code under test that would make its assertion
  fail. If there is none, the test is tautological. Read
  [tautological tests](references/tautological-tests.md) for the shapes: an assertion on a
  forced value, a mock echoing what the test configured, a re-implementation of the algorithm.
- Assert what this repository owns, not what a dependency produces: not its messages, output
  format, URLs, or call order. Read [dependency boundaries](references/dependency-boundaries.md)
  before asserting on a dependency's output, and whenever a dependency upgrade breaks a test.
- Add a focused failing test before a behavior change when the behavior can be tested.
- Do not use a clock to prove that nothing happened. Wait for the event that would have caused
  it, such as a sibling item processed in the same pass, then assert the target was skipped.
- Test the failure paths, authorization, and security-relevant validation, not only the path
  that succeeds.
- A test counts as evidence for an acceptance criterion only when it could have failed. The
  `agent-workflow` skill owns mapping each criterion to its evidence before handoff.
- For a contract about docs or instructions, test real paths, links, or executable behavior. Do
  not freeze prose wording unless a consumer parses that exact text.

## A flake fix removes the cause

A change that makes a flaky test pass and leaves its cause in place is a trade-off, not a
reliability fix. Do not describe it as one, and when reviewing, do not accept it as one. The
`debugging` skill owns finding the cause, and its "Fix the cause" list covers a retry, a longer
timeout, and a skipped or loosened test. A retry includes the runner's `retry` or `retries`
setting and a rerun loop in CI; a loosened test includes a wider threshold, baseline, tolerance,
or gate. Two more disguises:

- A suite made sequential, or moved to a serial project, so tests stop sharing state at the same
  time. The shared state is still there, and the suite is slower.
- A private database, or another private copy of shared state, for each worker. It can be the
  right design, but it costs setup time and stops the suite from catching interference between
  callers, so a person decides it. One suite that needs a quiet database for a specific
  assertion, such as a query plan, is not this.

A change called test-only touches no production code. When the fix needed a production change,
the defect was in the code: say so, and describe the change as a fix.

## Runner-specific rules

After the rules above, read the one file for the runner in use:

- Vitest, including backend integration tests and Next.js tests: [vitest](references/vitest.md)
- Backend integration tests that start processes or share a database:
  [backend integration](references/backend-integration.md)
- Storybook stories: [storybook](references/storybook.md)
- Swift and SwiftUI tests: [swift](references/swift.md)
- .NET tests, including MAUI: [dotnet](references/dotnet.md)
- Playwright and other browser tests: use the `playwright-authoring` skill as well.
- Replacing a parser, serializer, or library behind a stable interface:
  [replacing a library](references/replacing-a-library.md)

## Review

Ask of each test: which contract is this, what change makes it fail, and is there a lower layer
where the same failure would show sooner. Delete the test when there is no answer.
