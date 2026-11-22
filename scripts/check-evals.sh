#!/usr/bin/env bash
# Fails when a skill has no eval case that asserts the skill fired: a `tool_used` grader on the
# Skill tool that names the skill and does not allow zero calls. Also fails when a SKILL.md is
# longer than 150 lines; detail belongs in the skill's references/. Also fails when the case rows
# in evals/README.md differ from the case directories on disk, or its "N cases" count is wrong.
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
# Case rows in evals/README.md must match evals/<skill>/<case>/prompt.md on disk.
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
for p in evals/*/*/prompt.md; do
  p="${p#evals/}"
  echo "${p%/prompt.md}"
done | sort >"$tmp/disk"
# Table 1 is the results table, table 2 the "What each case checks" table.
readme_rows() {
  awk -v want="$1" '
    /^## Current results/ { section = 1 }
    /^## What each case checks/ { section = 2 }
    /^## (How to read|What the suite)/ { section = 0 }
    section == want && /^\| `[^`]+` / { sub(/^\| `/, ""); sub(/`.*/, ""); print }
  ' evals/README.md | sort
}
for table in 1 2; do
  readme_rows "$table" >"$tmp/table$table"
  label="results table"
  [ "$table" -eq 2 ] && label="what-each-case-checks table"
  while IFS= read -r row; do
    echo "::error::evals/$row has a case directory but no row in the evals/README.md $label" >&2
    status=1
  done < <(comm -23 "$tmp/disk" "$tmp/table$table")
  while IFS= read -r row; do
    echo "::error::the evals/README.md $label lists \`$row\` but evals/$row/prompt.md does not exist" >&2
    status=1
  done < <(comm -13 "$tmp/disk" "$tmp/table$table")
done
count="$(wc -l <"$tmp/disk" | tr -d ' ')"
stated="$(grep -m1 -oE '[0-9]+ cases\.' evals/README.md | grep -oE '[0-9]+' || true)"
if [ "$stated" != "$count" ]; then
  echo "::error::evals/README.md says ${stated:-no} cases near the top; $count case directories exist" >&2
  status=1
fi
exit "$status"
