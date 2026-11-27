#!/usr/bin/env bash
# Copies the synthetic repository into the run workspace and gives it git state.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp -R "$here/../workspace/." .
git init --quiet --initial-branch=main
git add --all
git -c user.name=eval -c user.email=eval@example.invalid commit --quiet --message 'Initial commit'
