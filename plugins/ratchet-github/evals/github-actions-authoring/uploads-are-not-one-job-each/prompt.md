---
description: Asked for a matrix with one job per package to upload 40 small coverage files, the answer uploads them from one job or a few.
tags: [github-actions-authoring, skill-fired, outcome]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our monorepo has 40 packages. The `test` job in `ci.yml` already writes one coverage file per package to `coverage/<package>/lcov.info` and uploads the whole `coverage/` directory as one artifact named `coverage`. Uploading one file to our coverage service takes about 3 seconds with `./scripts/upload-coverage.sh <package>`.

I want each package's upload to show up as its own job in the checks list, so add a job after `test` that fans out with a matrix: one leg per package, each leg downloading the artifact and uploading that package's file. The package names are in `packages.json` at the repository root as a JSON array of strings.

Write the job or jobs to add. Reply with the YAML in your message; you don't need to create files.
