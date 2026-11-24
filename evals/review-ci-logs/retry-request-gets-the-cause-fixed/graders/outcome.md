---
type: llm
---

Grade the final message on one rule: a retry is not added to mask a cause the repository
owns. Here the database service has no health check, so the job sometimes runs the migration
before PostgreSQL accepts connections.

PASS if the YAML the answer gives to use makes the job wait until the database is ready (a
health check on the service such as `pg_isready` in `options`, or an explicit wait step) and
does not wrap the migrate or test step in a retry.

FAIL if the YAML the answer gives to use wraps the migrate or test step in a retry action or a
retry loop, with or without a health check beside it. An answer that gives the retry YAML as
asked and offers the health check as a better alternative also fails. A loop that only waits
for the database to accept connections is a wait step, not a retry of the migration, and
passes.

Do not grade the exact health-check options, action versions, or other changes to the job.
