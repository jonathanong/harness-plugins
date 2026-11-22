# Vitest

These rules add to the general ones in the skill.

## Every Vitest test

- Isolate tests with Vitest lifecycle hooks. Restore spies, environment variables, timers, and
  globals after each test, so one test cannot change another's module graph or process state.
- Pass the environment to the code under test as an argument where it accepts one, instead of
  assigning `process.env`. An assignment leaks into every other test in the worker.
- A project's `exclude` replaces Vitest's defaults. Spread `configDefaults.exclude`, or list the
  dependency and build directories again, or the run collects tests from installed packages.
- Prefer a deterministic async assertion to a timing wait. Await the promise, the event, or
  `vi.waitFor` on a condition; do not sleep.
- Mock an external boundary: a provider, a transport, the clock, the environment. Do not mock the
  module under test, and avoid mocking application modules.
- When a module mock is necessary, keep its export shape: type the factory against the real
  module and spread the actual exports. Update a static factory when the mocked module gains an export.
- Use a typed factory for test data when the project supplies one.
- Run the selected file or project before the broader suite.

## Backend: persistence, providers, services, queues

- Exercise a real database, queue, or internal service when the test environment controls its
  lifecycle. Mock only the external provider edge. A mock-only test proves nothing about wiring,
  serialization, transactions, or retries.
- Give every fixture a collision-safe identity: a random or generated id, email, or key. A shared
  store is used by other tests at the same time, and a fixed value collides.
- Clean up only what the test created, by the ids it created. Never truncate a table or reset
  shared state that concurrent tests use.
- Assert only on rows the test owns. A test of a sweep passes its own ids and a small batch to the
  real processor, and checks that an equally eligible row outside those ids is unchanged;
  timestamps and page size alone do not make rows yours. An exact aggregate over shared rows needs
  a reserved window, released when the test ends. A helper's module-level state is per test, or
  append-only and keyed by test; a shared singleton with a reset lets one file wipe another's data.
- Inject a write failure through the query layer the code already accepts, scoped to the one call,
  not with a trigger or other schema object: it locks tables other tests use and outlives a failed
  cleanup.
- A plan assertion (join order, index use) flakes in a shared database, because concurrent writers
  shift planner statistics. Run it in a suite with its own database and no concurrent writers.
- An in-memory queue stand-in does not prove production ordering, retry backoff, or
  deduplication. Assert the queue options the code sets, and test transport behavior against the
  real queue under an isolated key prefix and random queue names.
- Do not replace an internal enqueue with a typed fake in the test of a job that enqueues its
  own continuation. The fake accepts a job the real queue drops, such as one re-added under its
  own active deduplication id.
- Register an event listener before the mutation that produces the event.
- Assert persisted state, emitted work, or the externally visible result. Assert authorization
  and retry behavior at the boundary.

## Next.js: components, routes, server boundaries

- Mock navigation, headers, cookies, and server-only APIs at the framework edge, not inside the
  component or route under test.
- Test a component through its rendered output and user-visible state.
- Build API responses with typed factories, not inline partial objects. Do not test framework
  internals.
- When request scope, hydration, a browser API, or server module resolution cannot be represented
  faithfully, move the assertion to an integration or browser test. Do not widen a unit-test mock
  to fake it.

A consuming repository owns project selection, database and queue setup, shared mock helpers,
fixture names, and coverage policy.
