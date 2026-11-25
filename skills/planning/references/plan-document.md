# Plan document template

Read this when writing a plan for a substantial change or an initiative. Open with the summary, name
the reader, and follow the `technical-writing` skill for structure. Drop a section that has nothing
to say instead of writing "none", except stop conditions and definition of done.

The test: could an agent with no access to this conversation, and no assumptions about your tools,
execute the plan and know when to stop? Avoid "as discussed", "the above", "we agreed", and any
pointer to chat. Define each term or link it.

```markdown
# <Change, in plain words>

Reader: <who executes this, and what they can be assumed to know>

## Summary

<Outcome in two or three sentences.>

| Behavior | Before | After |
| -------- | ------ | ----- |

## Context

- Repository, base branch and commit: <...>
- Start from: <folders, files, symbols, commands>
- Linked issues and docs: <links, not pasted content>

## Decisions

- User: <decision>. Rejected: <alternatives and why>.
- Agent: <decision>, because <reason>. Rejected: <alternatives and why>.

## Constraints

- <Skill or file to load>: <the constraint that applies. When the reader may lack the skill,
  quote the constraint here once.>

## Impact

- Code: <paths, from the queries below>
- Tests and e2e specs: <paths>
- User-visible behaviors that change or could break: <flows, pages, responses, emails, jobs>
- Queries run: <commands and what they returned; what remains uncertain>

## Steps

1. <Step>. Can run in parallel with: <step numbers, or "none">. Waits for: <step and why>.
   - Acceptance: <observable criterion>
   - Verify: `<exact command>`

## Final verification

<Graph-selected tests, impacted checks, and the before/after rows confirmed. See the planning
skill for the commands.>

## Non-goals

- <What this change must not do, and what is left for later>

## Risks and rollback

- <Risk>: <mitigation>. Rollback: <how to undo, and what cannot be undone>

## Assumptions to verify first

- <Assumption>: verify with `<command>`. If false: <what changes>

## Stop and ask when

- <A condition under which the implementer stops and asks instead of deciding>

## Definition of done

- Deliverables: <PRs, migrations, docs>
- Evidence to attach: <command output, spec results, screenshots>
```

For an initiative, add a phase list before the steps. Each phase is one pull request that ships and
verifies on its own, with its own acceptance and verification, and the rollout follows
`feature-rollout`.
