# Audit issue taxonomy

Read this when asked to review or clean up a repository's or an organization's labels,
milestones, or projects. An audit is read-only: it changes no label, milestone, project, issue,
or local file unless the request authorizes that change. The rules for applying and creating
labels are in the `github-issue` skill.

## Gather

1. Resolve the repository: its canonical name, and that it is not archived.
2. Fetch the live labels with their descriptions, colors, and usage counts; the milestones, open
   and closed; and the projects, open and closed, with their descriptions and items.
3. Read the declared label source when `AGENTS.md` names one, such as an infrastructure-as-code
   file that defines labels every repository shares, and the repository's labeler configuration.
4. Find which labels automation owns: a labeler rule, a bot, or a workflow that sets or reads
   them. Read that automation before recommending a rename, a deletion, or a rule change.

## Check

**Labels**

- Aliases and near-duplicates: `bug`, `Bug`, and `type: bug`; `docs` and `documentation`.
- Sprawl: labels made for one piece of work, such as a sprint, a release, a migration, or a
  cleanup. That belongs in a milestone or a project.
- Unused labels, labels with no description, and labels whose meaning is ambiguous.
- Colors that break the scheme the other labels follow, such as one color per prefix.
- Drift: a label on GitHub that the declared label source does not define, or one the source
  defines that is missing or different on GitHub.
- Path labels with no labeler rule, and labeler rules for labels that do not exist.

**Milestones**

- Milestones that overlap in scope or dates, and work with no milestone to land in.
- A milestone theme repeated across repositories is a candidate project.

**Projects**

- A project that holds only routine work, not an initiative, is a candidate milestone. The number
  of repositories is not the signal.
- A project with no description; an empty or stale project; a closed project with open items.
- An issue in more than one project, where the one-project rule applies.
- Auto-add of a parent issue's sub-issues, where it can put an item in a second project.

## Report

- Give each finding with the exact change recommended and what it moves: the issues relabeled,
  the automation or labeler rule to update, the label source to edit.
- Separate safe cleanup from decisions that need someone's product or scheduling judgment.
- Make an approved label change as the `github-issue` skill's "Labels" section says.
