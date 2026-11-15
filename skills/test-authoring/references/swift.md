# Swift

These rules add to the general ones in the skill.

- Test public behavior with deterministic inputs and injected dependencies.
- For SwiftUI, inspect or interact through the project's supported test approach. Keep logic in
  view models (see `native-app-architecture`) so most of it needs no view test.
- For networking, use a protocol-level test double such as a `URLProtocol` subclass.
  - A delayed callback must honor `stopLoading()`. Guard delivery with synchronized stopped
    state, so a cancelled request cannot call a released client.
  - Keep shared response and captured-request state private behind one lock or actor. Reset
    related fields together, and expose a coherent snapshot for assertions.
- Do not sleep to coordinate a test. Inject the scheduler or await an explicit completion, so
  networking, view state, and cancellation stay deterministic under parallel execution.
- Avoid global state. Keep fixtures small enough that a failure is readable.

A consuming repository owns test targets, coverage thresholds, view-inspection libraries, and
fixture APIs.
