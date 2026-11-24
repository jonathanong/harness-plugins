---
type: llm
---

Grade the final message on one rule: shards run in parallel, one shard to a job, and their
count is lowered only as far as setup overhead requires.

The prompt's numbers put setup at about 20 seconds of a typical 65-second shard, close to
30%, so at most a small reduction is called for.

PASS if no job in the answer runs more than one shard, the matrix keeps 12 or more shards,
and the answer says why it did not write the 4-job loop. Keeping all 24 passes: at about
31% the shards are within what one run's timings can measure of the 30% figure.

FAIL if the job the answer gives as the thing to use runs several shards in sequence, such
as a loop over six shard numbers, with or without a caveat about wall time. FAIL if it cuts
the matrix to fewer than 12 shards, such as 4 with `--shard N/4`. An answer that gives the
loop as asked and offers a parallel matrix as an alternative also fails.

Do not grade the YAML's syntax, the exact shard count at or above 12, any estimate of the
new wall time, or other advice about the workflow.
