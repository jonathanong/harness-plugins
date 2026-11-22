# Backend integration tests

- Reserve the ports that child processes listen on from a range outside the kernel's ephemeral
  range. Asking the kernel for port 0, reading it, closing it, and reusing the number races with
  every other process that gets an ephemeral port in between.
- A repeated run needs no manual cleanup, and no test depends on a pristine database. Each test
  creates the rows it needs under unique values and tolerates leftovers from earlier runs.
- A run fails on any backend 5xx seen in its traces, even when the test's own assertion passed.
  A server error the test did not look for is still a defect.
- Tests boot prebuilt artifacts and never build implicitly. A test that compiles on demand hides
  a stale build or makes the first run slow and flaky; the build is an explicit step before the
  suite.
