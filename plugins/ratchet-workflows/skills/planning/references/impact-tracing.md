# Impact tracing

Read this when tracing what a change touches (step 3 of the planning skill).

Prefer a dependency-graph tool when one is installed. `no-mistakes` is a public CLI that builds the
graph from the source. Fall back to grep and the language server when none is installed, and say
that the result is a text search.

| Question                                                        | Command                                                    |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| What imports these files?                                       | `no-mistakes dependents <file>...`                         |
| Which tests reach this symbol (works before any change exists)? | `no-mistakes tests impact <file#symbol>... --format paths` |
| Which server components or pages import this component?         | `no-mistakes rsc-callers`                                  |
| Which browser tests cover this route or selector?               | `no-mistakes playwright`                                   |
| Which producers and workers share this queue?                   | `no-mistakes queues`                                       |
| What is the route graph of the server?                          | `no-mistakes server`                                       |
| Which workflows does this change trigger?                       | `no-mistakes ci`                                           |
| What is the minimal local validation for the change?            | `no-mistakes impacted-checks --base origin/main`           |

Run `no-mistakes <command> --help` for the options; the table is a starting point.

## Reading the results

- Record each query you ran and its result in the plan's impact section, so the reader can rerun it.
- An empty result is not proof. Dynamic imports, string-referenced config, generated code,
  reflection, and files outside the graph are invisible to it. Name what you checked another way.
- Check the graph's answer against the source for the two or three most important dependents.
- `tests impact` needs only a file and symbol, so use it while planning. The `tests plan ...
  --from-git-diff` form needs a diff, so use it after implementing, in the final verification.
