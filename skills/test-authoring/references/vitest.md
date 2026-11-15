# Vitest

These rules add to the general ones in the skill.

## Every Vitest test

- Isolate tests with Vitest lifecycle hooks. Restore spies, environment variables, timers, and
  globals after each test, so one test cannot change another's module graph or process state.
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
