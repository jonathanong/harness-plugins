#!/usr/bin/env bash
# Fails when a skill has no eval case that asserts the skill fired: a `tool_used` grader on the
# Skill tool that names the skill and does not allow zero calls. Also fails when a SKILL.md is
# longer than 150 lines; detail belongs in the skill's references/. Also fails when the cases in
# evals/cases.csv differ from the case directories on disk, when a case has more than one
# priority tag or an unknown one, or when a generated table is out of date.
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
# Cases in evals/cases.csv must match evals/<skill>/<case>/prompt.md on disk.
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
for p in evals/*/*/prompt.md; do
  p="${p#evals/}"
  echo "${p%/prompt.md}"
done | sort >"$tmp/disk"
tail -n +2 evals/cases.csv | cut -d, -f1 | sort >"$tmp/listed"
while IFS= read -r row; do
  echo "::error::evals/$row has a case directory but no row in evals/cases.csv" >&2
  status=1
done < <(comm -23 "$tmp/disk" "$tmp/listed")
while IFS= read -r row; do
  echo "::error::evals/cases.csv lists $row but evals/$row/prompt.md does not exist" >&2
  status=1
done < <(comm -13 "$tmp/disk" "$tmp/listed")
if [ -n "$(uniq -d "$tmp/listed")" ]; then
  echo "::error::evals/cases.csv lists a case twice: $(uniq -d "$tmp/listed" | tr '\n' ' ')" >&2
  status=1
fi
# A case has at most one priority tag in its frontmatter, from a known set; none means medium.
for p in evals/*/*/prompt.md; do
  tags="$(awk 'NR == 1 && /^---$/ { on = 1; next } on && /^---$/ { exit } on' "$p" |
    grep -oE 'priority-[A-Za-z0-9_-]+' || true)"
  if [ "$(grep -c . <<<"$tags")" -gt 1 ]; then
    echo "::error::$p has more than one priority tag: $(tr '\n' ' ' <<<"$tags")" >&2
    status=1
  fi
  for tag in $tags; do
    case "$tag" in
    priority-critical | priority-high | priority-low) ;;
    *)
      echo "::error::$p has an unknown priority tag $tag; use priority-critical, -high, or -low" >&2
      status=1
      ;;
    esac
  done
done
# The case table, the per-skill table, and the headline are generated from evals/cases.csv.
python3 scripts/eval-docs.py --check || status=1
exit "$status"
