# Organize issues

Read this before triaging, relabeling, prioritizing, or assigning milestones or projects to
existing issues or pull requests. The repository's `AGENTS.md` owns its priorities, labels,
milestones, projects, default scope, and permissions, and overrides these defaults.

## Steps

1. Resolve the repository (see "Authority to write" in [the skill](../SKILL.md)). Fetch the live
   labels, the milestones and their descriptions, the open projects and their descriptions, and
   the issues or pull requests in scope with their discussion. Labeling a pull request does not
   need issues to be enabled.
2. Classify each item from its metadata and discussion, not from a guess about the code.
3. Keep automation, ownership, and provenance labels, such as a label a bot or a labeler rule
   sets, unless the repository's policy says they may change.
4. Apply existing labels and projects; applying one needs no approval beyond the request to
   organize. Do not create a label without the approval [the skill](../SKILL.md#labels)
   describes. Create a milestone without asking when the work needs one: it is an epic in one
   repository, made for that work and closed with it. Do not reopen a closed milestone; it
   records work that ended. Create a project only with the person's explicit approval, since a
   project is a high-level initiative across repositories; adding items to an existing project
   needs none. Do not close an item, rewrite a body, or change a title unless the request
   authorizes it.
5. In review mode, report the exact change proposed for each item and make none. In apply mode,
   make only the changes needed, and make each one safe to repeat.
6. Fetch every touched item again. Check the requested metadata, including project membership,
   and that automation, ownership, and provenance labels are intact. Report changed, unchanged,
   and ambiguous items separately, and any item a project's automation pulled in.

## Projects and milestones

- A project tracks a high-level initiative across repositories. A milestone is an epic in one
  repository: a release or a sequence of work, closed when the work is done. Work in one
  repository goes in a milestone; an initiative across repositories goes in a project, and can
  also have a milestone in each repository it touches.
- An issue belongs to at most one project, unless the repository's `AGENTS.md` says otherwise,
  and not every issue needs one.
- Before adding an item to a project, check that item and anything the project's automation
  could pull in with it, such as a parent issue's sub-issues. If any of them already belongs to a
  different project, skip the add and report the conflict. After the add, read the project again.
- A missing project scope or permission skips the project step only. Report the gap; the item's
  other metadata still goes ahead.
- Do not set a project status that closes the issue unless closing was asked for. GitHub's
  auto-close workflow closes an issue when its status becomes Done.
- A plan issue takes the milestone of the issue it came from. When that issue is in a project,
  fetch its memberships again and add the plan to that project only when there is exactly one
  open membership you can access; otherwise skip the project and report the conflict.
