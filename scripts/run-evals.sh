#!/usr/bin/env bash
# Runs the eval suite, one plugin at a time, with that plugin installed: Sonnet runs the cases,
# Opus judges them. Each plugin's cases live in plugins/<plugin>/evals/, and each run writes
# evals/results/latest-<plugin>.json.
# EVAL_ABLATION=with-without adds a no-plugin arm, for checking that a new case is not one the
# model already passes on its own.
# Usage: scripts/run-evals.sh [skill ...]   (default: every skill of every plugin)
# A skill's plugin is found from its directory; only the plugins of the named skills run.
# Extra `claude plugin eval` flags go in EVAL_FLAGS, e.g. EVAL_FLAGS='--runs 1'.
# EVAL_STOP_EARLY=1 runs scripts/eval-rounds.py instead: two attempts, then one at a time, stopping each case
# once its verdict against its priority target cannot change. EVAL_MAX_COST_USD caps the cost of
# each plugin's run. It exits 1 when a case misses its target.
set -euo pipefail

cd "$(dirname "$0")/.."
root="$PWD"
for skill in "$@"; do
  if ! compgen -G "plugins/*/skills/$skill" >/dev/null; then
    echo "No skill named $skill under plugins/*/skills/" >&2
    exit 2
  fi
done
mkdir -p evals/results
rm -f evals/results/latest-*.json
status=0
for plugin in plugins/*/; do
  plugin="${plugin%/}"
  name="$(basename "$plugin")"
  tags=()
  for skill in "$@"; do
    if [ -d "$plugin/skills/$skill" ]; then
      tags+=("$skill")
    fi
  done
  if [ "$#" -gt 0 ] && [ "${#tags[@]}" -eq 0 ]; then
    continue
  fi
  if [ "${EVAL_STOP_EARLY:-}" = 1 ]; then
    python3 scripts/eval-rounds.py --plugin "$plugin" ${tags[@]+"${tags[@]}"} || status=$?
    continue
  fi
  # shellcheck disable=SC2086 # EVAL_FLAGS is a list of flags.
  claude plugin eval "$plugin" \
    --trust-plugin \
    --scaffold \
    --model "${EVAL_MODEL:-sonnet}" \
    --judge-model "${EVAL_JUDGE_MODEL:-opus}" \
    --concurrency "${EVAL_CONCURRENCY:-6}" \
    --ablation "${EVAL_ABLATION:-none}" \
    --no-publish \
    --keep-temp \
    --json "$root/evals/results/latest-$name.json" \
    ${EVAL_FLAGS:-} \
    --allow-tools Bash \
    ${tags[@]+--tag "${tags[@]}"} || status=$?
done
exit "$status"
