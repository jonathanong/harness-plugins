#!/usr/bin/env bash
# Copies the synthetic repository and this case's findings export into the run workspace.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp -R "$here/../workspace/." .
git init --quiet --initial-branch=main
git remote add origin git@github.com:acme-evals/shop.git
git add --all
git -c user.name=eval -c user.email=eval@example.invalid commit --quiet --message 'Initial commit'
git update-ref refs/remotes/origin/main HEAD
git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main
cp "$here/findings-export.json" findings-export.json
