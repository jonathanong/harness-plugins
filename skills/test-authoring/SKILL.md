---
name: test-authoring
description: Decide which tests to write and how to build fixtures, mocks, helpers, and guards so each test fails for one real reason. Use when writing, reviewing, fixing, or deleting any automated test, fixture, or test helper - Vitest or Jest, backend integration, Next.js, Storybook stories, Swift, or .NET. For browser tests, also use playwright-authoring.
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
- Keep a fixture minimal and typed: only the fields this test reads.

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
- Test the failure paths, authorization, and security-relevant validation, not only the path
  that succeeds.
- A test counts as evidence for an acceptance criterion only when it could have failed. The
  `agent-workflow` skill owns mapping each criterion to its evidence before handoff.
- For a contract about docs or instructions, test real paths, links, or executable behavior. Do
  not freeze prose wording unless a consumer parses that exact text.

## Runner-specific rules

After the rules above, read the one file for the runner in use:

- Vitest, including backend integration tests and Next.js tests: [vitest](references/vitest.md)
- Storybook stories: [storybook](references/storybook.md)
- Swift and SwiftUI tests: [swift](references/swift.md)
- .NET tests, including MAUI: [dotnet](references/dotnet.md)
- Playwright and other browser tests: use the `playwright-authoring` skill as well.

## Review

Ask of each test: which contract is this, what change makes it fail, and is there a lower layer
where the same failure would show sooner. Delete the test when there is no answer.
