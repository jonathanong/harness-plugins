#!/usr/bin/env bash
# Fails when a skill has no eval case that asserts the skill fired.
set -euo pipefail

cd "$(dirname "$0")/.."
status=0
for skill in skills/*/; do
  name="$(basename "$skill")"
  pattern="(?:[\\w-]+:)?${name}\""
  if ! grep -rqsF --include="*.md" -e "$pattern" "evals/$name"; then
    echo "::error::$name has no skill-fired eval case under evals/$name" >&2
    status=1
  fi
done
exit "$status"
