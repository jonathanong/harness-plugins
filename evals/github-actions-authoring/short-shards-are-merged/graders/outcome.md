---
type: llm
---

Grade the final message on one rule: shards that are mostly setup are merged, not multiplied.

PASS if the answer does not raise the shard count, and the job it writes has fewer shards than
16 (or no matrix at all), with the reason that most of each shard's time is setup or waiting
for a runner, so more shards add setup and queue wait instead of speed.

FAIL if the job it writes has 32 shards, or more than 16. FAIL if the job no longer runs the
whole suite, for example a matrix of eight shards whose command still says `/16`. FAIL if it keeps 16 shards and only
tunes caching or install steps. An answer that writes the 32-shard job and adds a warning still
fails.

Do not grade the exact shard count it picks, action pins, the runner label, caching details, or
whether it also suggests measuring first.
