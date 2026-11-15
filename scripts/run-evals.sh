#!/usr/bin/env bash
# Runs the eval suite: Sonnet runs the cases, Opus judges them. Each case runs with the plugin and
# without it.
# Usage: scripts/run-evals.sh [skill ...]   (default: every skill)
# Extra `claude plugin eval` flags go in EVAL_FLAGS, e.g. EVAL_FLAGS='--runs 1'.
set -euo pipefail

cd "$(dirname "$0")/.."
tags=()
if [ "$#" -gt 0 ]; then
  tags=(--tag "$@")
fi

# shellcheck disable=SC2086 # EVAL_FLAGS is a list of flags.
claude plugin eval . \
  --trust-plugin \
  --scaffold \
  --model "${EVAL_MODEL:-sonnet}" \
  --judge-model "${EVAL_JUDGE_MODEL:-opus}" \
  --concurrency "${EVAL_CONCURRENCY:-6}" \
  --no-publish \
  --json evals/results/latest.json \
  ${EVAL_FLAGS:-} \
  --allow-tools Bash \
  ${tags[@]+"${tags[@]}"}
