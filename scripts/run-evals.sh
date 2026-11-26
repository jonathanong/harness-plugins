#!/usr/bin/env bash
# Runs the eval suite with the plugin installed: Sonnet runs the cases, Opus judges them.
# EVAL_ABLATION=with-without adds a no-plugin arm, for checking that a new case is not one the
# model already passes on its own.
# Usage: scripts/run-evals.sh [skill ...]   (default: every skill)
# Extra `claude plugin eval` flags go in EVAL_FLAGS, e.g. EVAL_FLAGS='--runs 1'.
# EVAL_STOP_EARLY=1 runs scripts/eval-rounds.py instead: two attempts, then one at a time, stopping each case
# once its verdict against its priority target cannot change. EVAL_MAX_COST_USD caps its cost.
# It exits 1 when a case misses its target.
set -euo pipefail

cd "$(dirname "$0")/.."
if [ "${EVAL_STOP_EARLY:-}" = 1 ]; then
  exec python3 scripts/eval-rounds.py "$@"
fi
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
  --ablation "${EVAL_ABLATION:-none}" \
  --no-publish \
  --json evals/results/latest.json \
  ${EVAL_FLAGS:-} \
  --allow-tools Bash \
  ${tags[@]+"${tags[@]}"}
