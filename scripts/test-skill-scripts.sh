#!/usr/bin/env bash
# Runs the tests of every script bundled in a skill (skills/<skill>/tests/test_*.py) under
# coverage.py, and fails below 100% line and branch coverage of skills/*/scripts. The scripts themselves use
# only the Python standard library; coverage.py is a test-time tool, pinned in requirements-dev.txt.
set -euo pipefail

cd "$(dirname "$0")/.."
python="${PYTHON:-python3}"
"$python" -m coverage erase
for tests in skills/*/tests; do
  "$python" -m coverage run --append -m unittest discover --start-directory "$tests" \
    --top-level-directory "$tests"
done
"$python" -m coverage report
