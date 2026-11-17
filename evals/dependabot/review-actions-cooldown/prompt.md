---
description: A review of a Dependabot setup whose auto-merge workflow holds a write token asks for at least seven days on every ecosystem and every semver key.
tags: [dependabot, skill-fired, review]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this pull request. It adds Dependabot auto-merge to a public repository. `AUTOMERGE_TOKEN` is a fine-grained token with Contents and Pull requests write, stored as a Dependabot secret.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: daily
    cooldown:
      default-days: 7
      semver-patch-days: 2 # patches are low risk; take them sooner
    open-pull-requests-limit: 5
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: daily
    cooldown:
      default-days: 7
      semver-patch-days: 1
    open-pull-requests-limit: 5
  - package-ecosystem: docker
    directory: /
    schedule:
      interval: daily
    open-pull-requests-limit: 5
```

```yaml
# .github/workflows/dependabot-automerge.yml
name: dependabot-automerge
on: pull_request
permissions:
  contents: read
jobs:
  automerge:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@08eba0b27e820071cde6df949e0beb9ba4906955 # v4.3.0
      - uses: dependabot/fetch-metadata@d7267f607e9d3fb96fc2fbe83e0af444713e90b7 # v2.4.0
        id: meta
      - if: steps.meta.outputs.update-type != 'version-update:semver-major'
        run: gh pr merge --auto --squash "$PR"
        env:
          PR: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.AUTOMERGE_TOKEN }}
```

Reply in your message; you don't need to create files.
