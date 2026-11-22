---
name: static-analysis-checklist
description: Use when adding, changing, or reviewing a lint rule, CI guard, policy check, or script that fails a build when it finds a pattern in code, configuration, or workflows. Place, author, and validate one static-analysis invariant.
---

# Static analysis checklist

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Use when adding or changing a static-analysis invariant. To choose which analyzers a repository
should run in the first place, use [static-code-analysis](../static-code-analysis/SKILL.md). Read
local `AGENTS.md`, analyzer documentation, rule inventory, and fixture conventions before selecting
an implementation. Local instructions own analyzer roots, fixture locations, commands, suppression
syntax, and rollout policy.

1. State the invariant and search for an existing analyzer, rule, or guard that owns it. Prefer the
   narrowest established owner over a parallel scanner.
2. For workflow or action policy, parse YAML instead of text matching. Inspect only intended
   tracked configuration files. A persistent-workspace guard enforces the persistent-workspace
   rules in [github-actions-authoring](../github-actions-authoring/SKILL.md): reject sparse-checkout inputs
   and unsafe writable workspace mounts, and allow unrelated YAML keys and ordinary read-only
   mounts.
3. Add meaningful accepted and rejected fixtures before the rule. Cover path routing, parser
   boundaries, equivalent YAML forms, and every allowed exception. Before replacing or deleting a
   security guard, port its old fixture corpus to the replacement and pass it first, so the
   rewrite cannot quietly stop blocking a case the old guard caught.
4. Keep discovery limited to tracked, intended files. A guard validates tracked git state:
   untracked and ignored files neither fail it nor satisfy it. A scan of tracked files sees a new file only
   after `git add`, so when a check says a new path does not exist, stage it before changing the
   rule. Make suppressions and allowlists narrow, justified, and mechanically checked for
   freshness where practical.
5. Run the focused fixture test and analyzer, then the local aggregate checks. Keep diagnostics
   actionable and deterministic.
6. Update the local inventory or documentation and delete superseded migration artifacts only when
   the replacement invariant is demonstrably enforced.
