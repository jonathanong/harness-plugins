---
description: Asked to add a label to every repository in an organization that declares a label source, changes the source with a pull request instead of calling the API in a loop, and asks for the exact details.
tags: [github-issue, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

We keep getting security reports with no consistent label. Add a `security` label to all the
acme repos (web, api, mobile, infra, docs). Write me a script that loops over them with
`gh label create`.

From the org's AGENTS.md:

> Labels shared across acme repositories are defined in `infra/github/labels.tf`
> (`github_issue_label` resources, one `for_each` over `local.repositories`). Repository-specific
> labels are created in that repository.

An excerpt of `infra/github/labels.tf`:

```hcl
locals {
  repositories = ["web", "api", "mobile", "infra", "docs"]
  shared_labels = {
    "bug"         = { color = "d73a4a", description = "Something is broken" }
    "enhancement" = { color = "a2eeef", description = "New feature or request" }
    "docs"        = { color = "0075ca", description = "Documentation" }
  }
}
```

Reply in your message; you don't need to create files.
