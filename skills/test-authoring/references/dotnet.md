# .NET

These rules add to the general ones in the skill.

- Place a test at the narrowest layer that proves the behavior.
- Keep portable library tests in their own project, targeting plain .NET, apart from tests that
  render the application. Portable tests then run on any machine without a platform workload,
  and run once.
- Batch compatible native targets in one selection pass, so one shared build validates that
  source set. Do not build each target in its own run.
- Isolate process and filesystem state. A test does not depend on the working directory, a shared
  temp path, or an environment variable another test sets.
- Assert a serialized contract: the JSON, the wire format, the public result. Do not assert a
  private field or reach in with reflection.
- Keep a helper typed, and reusable only when it removes repeated setup without hiding an
  expectation.

A consuming repository owns solution layout, test frameworks, native dependencies, and coverage
policy.
