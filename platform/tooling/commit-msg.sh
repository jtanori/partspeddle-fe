#!/usr/bin/env bash
set -euo pipefail

# Commit-msg hook delegated from .husky/commit-msg.
# Validates the commit message against the conventional commit format.

pnpm exec commitlint --edit "$1"
