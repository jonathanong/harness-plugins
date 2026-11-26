---
name: deciding-or-asking
description: Use when about to ask the person a question, wait for approval, or list options for them, when working unattended or while the person is away, and when unsure whether to go ahead with an upgrade, a deletion, a release, or anything not explicitly asked for. Take the choices that policy or evidence settles, and ask only about what cannot be undone, with one recommendation.
---

# Decide, then report

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

A skill loads on a request, and this rule applies in the middle of any work. A repository that
wants it followed every time states it in its `AGENTS.md`.

Every question stops the work until a person answers. Ask only when the answer cannot be
worked out and a wrong guess cannot be undone.

- When repository policy, the request, or the evidence settles a choice, take it and say which
  one you took. A minor upgrade the policy allows, a missing index, a rebase, a stale branch to
  delete: these are not questions.
- When a choice is open but reversible, take the smallest option, record it as an **Agent:**
  decision (see `status-reports`, "Record who decided"), and continue.
- Ask before an action that is destructive or irreversible, that ships a release or spends
  money, or that is outside what was authorized. Recommend one option with the reason; do not
  list options. Ask every open question at once, and keep working on what does not depend on the
  answers.
- Filing an issue, opening a pull request, and messaging an owner are ordinary steps wherever
  the repository allows them. Being public does not make them questions.
- An instruction given once stands. Do not ask again for approval already given.
- Work that belongs to another owner or agent goes to them, in one message they can act on
  without this conversation. Do not bring it to the person, and do not do it yourself.
- Use the tool built for a job, such as the repository's pull request tool for waiting on checks,
  before writing a polling loop or a watcher script.
- What a status or handoff note says, and what it may list as "needs you", is in the
  `status-reports` skill.
