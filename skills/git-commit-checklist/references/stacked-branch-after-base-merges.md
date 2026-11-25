# A stacked branch after its base merges

For a branch whose pull request was opened against another pull request's branch, after that
lower pull request merged. `origin` and `main` stand for the remote and the default branch.
`<base-head>` is the lower branch's last commit, the one that was reviewed and merged.
`<old-head>` is this branch's head before the update.

A squash merge puts the lower layer on `main` as one new commit. This branch still holds the
lower layer's original commits, so git sees two copies of the same change. Every file both
layers touched can conflict, even though `main` holds nothing this branch has not already seen.

## Steps

1. Point the pull request at `main` if the host did not retarget it when the lower branch was
   deleted.
2. Fetch, then compare `main` with the lower layer as it was merged:

   ```bash
   git fetch origin main
   git diff <base-head> origin/main --stat
   ```

   Empty output means `main` holds exactly the lower layer. Each file listed is work that
   reached `main` from somewhere else, and the resolution must keep it. Resolve by hand either
   way: an empty diff tells you what each hunk should come to, not that you may take this
   branch's side.

3. Merge `main` into the branch with `git merge origin/main`. A branch under review, or one that
   others may push to, is merged, not rebased.
4. Resolve each conflicted hunk by hand, as `SKILL.md` describes. In each hunk, this branch's
   side is the change under review. The `main` side is the lower layer's version, plus whatever
   step 2 listed in that file. Keep this branch's change and every line that step 2 accounts
   for.
5. Read the whole `git status`. A file the lower layer added and this branch deleted comes back
   staged, because the squash adds it again on `main`, and the merge reports no conflict for it. Remove it again with
   `git rm`. Read every other staged file the same way.
6. Check the result two ways before committing:

   ```bash
   git diff --cached <old-head>          # what the update changes on this branch
   git diff --cached origin/main --stat  # what the pull request will show
   ```

   The first shows only step 2's changes, and nothing when step 2 was empty. The second lists
   only this layer's own files. Then run the checks the conflicted files feed.

7. Commit with a message you wrote, such as `git commit -m "Merge origin/main into <branch>"`.
   Push. The merge is a new head, so it needs a fresh review.

A branch that nobody else pushes to and that has no review yet can instead replay only its own
commits: `git rebase --onto origin/main <base-head>`. That usually has no conflicts. Push it as
[rebase and lease push](rebase-and-lease-push.md) describes.
