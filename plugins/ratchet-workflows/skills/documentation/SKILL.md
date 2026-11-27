---
name: documentation
description: Use when writing or reviewing a README or a section of one, a docs page, or a code comment, including a diff that adds or changes one and a request to draft a section that holds numbers, status, or plans. Decide what belongs in docs and comments so they do not drift from the code. For AGENTS.md, also use agent-rules; for skills, skill-authoring.
---

# Documentation and comments

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Documentation goes stale when it repeats something the code already states. Write down what the
code cannot say, and link to the code for the rest.

## Docs

These rules are for documentation committed to live as long as the code: a README and the pages
under `docs/`. Such a page says what the system is and why it is that way. How it works is in
the code.

- Document why a design was chosen, and the invariants nothing enforces. Those are the facts a
  reader cannot recover from the source.
- Do not restate code, configuration values, limits, or counts. They change, and the copy does
  not. Name the setting and point at where it is defined.
- Do not write numbers that change, such as row counts, error rates, latencies, or user counts.
  Write how to get them: the query, command, or dashboard, so the reader fetches the current
  value. A point-in-time document may give a number with its date and source. For how a
  document is structured for its readers, use the `technical-writing` skill.
- Describe the system as it is. Three things stay out of these pages unless the repository
  says otherwise:
  - A roadmap goes in the issue tracker, a roadmapping tool, or a document platform outside the
    repository.
  - A plan is short-lived. It goes in an issue or a pull request description, and is not
    committed anywhere in the repository.
  - History ("previously", "we used to") goes in commit messages and the tracker.

  A record kept beside something that is not the product's code, such as an eval suite's
  `HISTORY.md` or `ROADMAP.md`, is not one of these pages, and its own skill says what it holds.

- In a public repository, leave out private detail: internal hostnames, customer names,
  incident narratives, unreleased plans.
- State a decision as a fact, not who made it, unless the person asks; the record of who decided
  belongs in the pull request or issue (`status-reports`, "Record who decided").
- When a change alters behavior a document describes, update the document in the same change.

## Comments

- Comment only a local invariant the code cannot show: why this order matters, what a caller must
  hold, which unusual input this branch exists for.
- Do not write a comment that explains the reason for a design or the history of a change. Put
  the design reason in the docs and the history in the commit message.
- Do not narrate what the next line does.
- Delete a comment when the code it describes goes.

## Agent instruction files

For what goes in `AGENTS.md`, a skill, or a docs page, and how they link, use the
`agent-rules` skill.
