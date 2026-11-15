#!/usr/bin/env bash
# Fails when a skill has no eval case that asserts the skill fired: a `tool_used` grader on the
# Skill tool that names the skill and does not allow zero calls. Also fails when a SKILL.md is
# longer than 150 lines; detail belongs in the skill's references/.
set -euo pipefail

cd "$(dirname "$0")/.."
status=0
for skill in skills/*/; do
  name="$(basename "$skill")"
  pattern="(?:[\\w-]+:)?${name}\""
  lines="$(wc -l <"$skill/SKILL.md")"
  if [ "$lines" -gt 150 ]; then
    echo "::error::$name/SKILL.md has $lines lines; the limit is 150. Move detail to references/." >&2
    status=1
  fi
  found=0
  while IFS= read -r grader; do
    if grep -qx 'type: tool_used' "$grader" && grep -qx 'tool: Skill' "$grader" &&
      ! grep -qEx '(min|max): 0' "$grader"; then
      found=1
    fi
  done < <(grep -rlsF --include="*.md" -e "$pattern" "evals/$name" || true)
  if [ "$found" -eq 0 ]; then
    echo "::error::$name has no skill-fired eval case under evals/$name" >&2
    status=1
  fi
done
exit "$status"
