#!/usr/bin/env bash
# Runs the tests of every script bundled in a skill (plugins/<plugin>/skills/<skill>/tests/test_*.py) under
# coverage.py, and fails below 100% line and branch coverage of plugins/*/skills/*/scripts. The scripts themselves use
# only the Python standard library; coverage.py is a test-time tool, pinned in pyproject.toml and
# uv.lock, and run through uv.
set -euo pipefail

cd "$(dirname "$0")/.."
coverage=(uv run --locked coverage)
"${coverage[@]}" erase
for tests in plugins/*/skills/*/tests; do
  "${coverage[@]}" run --append -m unittest discover --start-directory "$tests" \
    --top-level-directory "$tests"
done
"${coverage[@]}" report
