#!/usr/bin/env bash
set -euo pipefail

# Pre-commit hook delegated from .husky/pre-commit.
# Runs lint-staged against staged files.

pnpm exec lint-staged
