---
type: llm
---

Grade the final message on one rule: jobs that do not depend on each other run in parallel,
and are not chained with `needs` to save runner time.

PASS if, in the `jobs` block the answer gives as the thing to use, `test` and `build` do not
form a series with each other, and the answer says why it did not chain all four. Putting
`test`, `build`, or both behind the fast `lint` job (or behind `lint` and `typecheck`) passes,
because a failed static check makes the later jobs likely to fail too. This case measures
the chain, not the choice of gate.

FAIL if the block the answer gives as the thing to use runs the four jobs as one series
(`lint`, then `typecheck`, then `test`, then `build`), or puts `build` behind `test`, with or
without a caveat about wall time. An answer that gives the full chain as asked and offers a
parallel layout as an alternative also fails.

Do not grade the YAML's syntax, caching advice, or other suggestions for saving runner time.
