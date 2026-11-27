#!/usr/bin/env bash
# Fails when a skill has no eval case that asserts the skill fired: a `tool_used` grader on the
# Skill tool that names the skill and does not allow zero calls. Also fails when a SKILL.md is
# longer than 150 lines; detail belongs in the skill's references/. Also fails when the cases in
# evals/cases.csv differ from the case directories on disk (plugins/<plugin>/evals/<skill>/<case>), when a case has more than one
# priority tag or an unknown one, or when a generated table is out of date.
set -euo pipefail

cd "$(dirname "$0")/.."
status=0
for skill in plugins/*/skills/*/; do
  name="$(basename "$skill")"
  evals="$(dirname "$(dirname "$skill")")/evals/$name"
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
  done < <(grep -rlsF --include="*.md" -e "$pattern" "$evals" || true)
  if [ "$found" -eq 0 ]; then
    echo "::error::$name has no skill-fired eval case under $evals" >&2
    status=1
  fi
done
# A skill name is used by one plugin, and a skill's cases sit in that plugin.
dup="$(for skill in plugins/*/skills/*/; do basename "$skill"; done | sort | uniq -d | tr '\n' ' ')"
if [ -n "$dup" ]; then
  echo "::error::more than one plugin has a skill named: $dup" >&2
  status=1
fi
for dir in plugins/*/evals/*/; do
  # The runner writes its reports to evals/results/, which git ignores.
  if [ "$(basename "$dir")" = results ]; then
    continue
  fi
  if [ ! -d "$(dirname "$(dirname "$dir")")/skills/$(basename "$dir")" ]; then
    echo "::error::$dir has cases for a skill that is not in the same plugin" >&2
    status=1
  fi
done
# Cases in evals/cases.csv must match plugins/<plugin>/evals/<skill>/<case>/prompt.md on disk.
# A skill and its cases are in the same plugin, and a skill name is used once.
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
for p in plugins/*/evals/*/*/prompt.md; do
  p="${p#plugins/*/evals/}"
  echo "${p%/prompt.md}"
done | sort >"$tmp/disk"
tail -n +2 evals/cases.csv | cut -d, -f1 | sort >"$tmp/listed"
while IFS= read -r row; do
  echo "::error::$row has a case directory under plugins/*/evals but no row in evals/cases.csv" >&2
  status=1
done < <(comm -23 "$tmp/disk" "$tmp/listed")
while IFS= read -r row; do
  echo "::error::evals/cases.csv lists $row but plugins/*/evals/$row/prompt.md does not exist" >&2
  status=1
done < <(comm -13 "$tmp/disk" "$tmp/listed")
if [ -n "$(uniq -d "$tmp/listed")" ]; then
  echo "::error::evals/cases.csv lists a case twice: $(uniq -d "$tmp/listed" | tr '\n' ' ')" >&2
  status=1
fi
# A case has at most one priority tag in its frontmatter, from a known set; none means medium.
for p in plugins/*/evals/*/*/prompt.md; do
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
