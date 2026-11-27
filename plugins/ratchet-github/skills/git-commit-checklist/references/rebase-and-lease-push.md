# Rebase and lease push

For a branch that other people or agents may also write. Update this branch; do not open a
replacement pull request. `origin` and `main` stand for the repository's remote and default branch.

## Setup

- Run `git fetch origin main <branch>` as its own command. Do not chain it with a rebase, reset,
  or merge: read the result first.
- `HEAD` must be the branch being updated.
- A dirty worktree stops you before a fast-forward, reset, or rebase. Do not switch branches to
  get around it.
- Continue a conflicted rebase with `GIT_EDITOR=true git rebase --continue`.
- Resolve a conflict by meaning: find the invariant the upstream change protects, keep both
  changes, and rerun the tests for it. Do not pick one whole file.

## Read both sides

- Print `git rev-parse` for `HEAD`, `origin/<branch>`, and `origin/main`. Local `main` is never
  the rebase target; it may be behind.
- `git rev-list --left-right --count HEAD...origin/<branch>` gives two numbers: commits only on
  the local branch, then commits only on the remote branch.
- `git cherry -v origin/<branch> HEAD` marks each local commit. A leading `-` is the same patch
  already on the remote under another SHA. A leading `+` is a patch the remote lacks.
- Commits on `origin/<branch>` that match nothing local are new work someone pushed.

## Decide

`git merge-base --is-ancestor origin/main HEAD` exits 0 when the branch already contains
`origin/main`. Run it before any move and after every move.

| Local / remote counts                                      | Action                                                                                                                                                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0 0`, and `origin/main` is an ancestor                    | Stop. Nothing to do.                                                                                                                                                                                       |
| `0 0`, and `origin/main` is not an ancestor                | Rebase onto `origin/main`, then lease push.                                                                                                                                                                |
| `0 N`                                                      | `git merge --ff-only origin/<branch>`, then the ancestor check.                                                                                                                                            |
| `N 0`                                                      | Your own unpushed work. With `origin/main` an ancestor, `git push origin <branch>`. Otherwise rebase onto `origin/main`, then lease push. If the remote was rewound and you did not do it, stop and ask.   |
| Diverged, and every local-only commit has cherry `-`       | The remote was rewritten and holds the same patches. With a clean tree, `git reset --hard origin/<branch>`, then the ancestor check. Matching subjects alone do not prove this; require the cherry result. |
| Diverged, with new remote patches and unique local commits | `git rebase origin/<branch>` as its own command, then the ancestor check, then lease push. If the remote rewrite changed patches that your local work builds on, stop and ask.                             |

## Lease push

- Capture `<sha>` with `git rev-parse origin/<branch>` after the setup fetch and before any
  rewrite or later fetch. A later fetch silently widens the lease to whatever arrived.
- Push with `git push --force-with-lease=<branch>:<sha> origin <branch>`.
- If `HEAD` equals `<sha>`, do not push.
- If the push is rejected, fetch again and read both sides again.
