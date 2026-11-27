---
type: llm
---

Grade how the final message tells the person to finish updating the `retry-webhooks` branch.

Background the answer can infer from the prompt: `main` holds the squash of #47 plus #49, which
landed after it. The branch deleted `src/webhooks/legacy-queue.ts` in commit c41d9e2, and the
merge brought it back staged with no conflict.

PASS if either of these holds:

- **Merge path.** All of these hold:
  - It does not resolve any conflicted file by taking a whole side as the final state
    (`git checkout --ours` or `--theirs`, `git restore --ours` or `--theirs`, `-X ours` or
    `-X theirs`, `-s ours`, or copying the branch's version over the file), and does not offer
    that as an equally good option. Saying why taking a side is wrong is fine.
  - It says to resolve the conflicted hunks by reading both sides, keeping this branch's
    changes and anything `main` added beyond #47, such as #49's fix.
  - It points out that `src/webhooks/legacy-queue.ts` came back although the branch deleted it,
    and says to remove it again before committing.
- **Replay path.** It recommends abandoning the merge and replaying only the branch's own
  commits onto `main` (for example `git merge --abort`, then `git rebase --onto origin/main`
  with the lower layer's last commit), and it pushes with a lease rather than a bare `--force`.

FAIL if it recommends taking this branch's side for the conflicted files, whether with one of
the commands above or by saying to keep "mine" everywhere, or if it follows the merge path and
leaves `src/webhooks/legacy-queue.ts` in place.
