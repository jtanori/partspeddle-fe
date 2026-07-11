#!/usr/bin/env bash
#
# Delivery Certification — Phase 1 Benchmark Script
#
# Run this from the repository root.
# It gathers evidence for DC-0 (toolchain), DC-1 (Docker), DC-2 (Husky),
# and DC-4 (Fly/Supabase status) without pushing anything or exposing secrets.
#
# Usage:
#   chmod +x .planning/temp/benchmark-delivery.sh
#   ./.planning/temp/benchmark-delivery.sh | tee benchmark-delivery-$(date +%Y%m%d-%H%M%S).log

set -euo pipefail

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log_section() {
  echo ""
  echo "================================================================================"
  echo " $1"
  echo "================================================================================"
  echo ""
}

log_step() {
  echo ""
  echo "--- $1 ---"
}

run_timed() {
  local label="$1"
  shift
  echo "[TIMER START] $label"
  echo "[CMD] $*"
  local start end elapsed
  start=$(date +%s)
  if "$@"; then
    end=$(date +%s)
    elapsed=$((end - start))
    echo "[TIMER END] $label: ${elapsed}s"
  else
    end=$(date +%s)
    elapsed=$((end - start))
    echo "[TIMER END] $label: ${elapsed}s (EXIT CODE: $?)"
  fi
  echo ""
}

# ---------------------------------------------------------------------------
# Baseline info
# ---------------------------------------------------------------------------

log_section "DC-0: Toolchain Baseline"

log_step "OS / Date"
uname -a
date -u +"%Y-%m-%dT%H:%M:%SZ"

log_step "Node / Package Managers"
command -v node && node -v || echo "node: not found"
command -v npm && npm -v || echo "npm: not found"
command -v pnpm && pnpm -v || echo "pnpm: not found"
command -v corepack && corepack --version || echo "corepack: not found"

log_step "Git"
command -v git && git --version || echo "git: not found"
git config --get init.defaultBranch || echo "init.defaultBranch: not set"

log_step "Docker"
command -v docker && docker --version || echo "docker: not found"
docker info --format '{{.ServerVersion}}' 2>/dev/null || echo "docker daemon: not reachable"

log_step "Flyctl"
command -v flyctl && flyctl version || echo "flyctl: not found"
flyctl auth whoami 2>/dev/null || echo "flyctl auth: not authenticated"

log_step "Supabase CLI"
command -v supabase && supabase --version || echo "supabase: not found"

log_step "GitHub CLI"
command -v gh && gh --version | head -1 || echo "gh: not found"

# ---------------------------------------------------------------------------
# Husky / lint-staged benchmark
# ---------------------------------------------------------------------------

log_section "DC-2: Husky / lint-staged Benchmark"

BASE_BRANCH=$(git branch --show-current)
TEST_BRANCH="throwaway/benchmark-$(date +%s)"
TEST_FILE="src/lib/constants.ts"

cleanup() {
  log_step "Cleanup"
  git checkout "$BASE_BRANCH" 2>/dev/null || true
  git branch -D "$TEST_BRANCH" 2>/dev/null || true
  git reset --hard HEAD 2>/dev/null || true
}
trap cleanup EXIT

git checkout -b "$TEST_BRANCH"

# Make sure the target file exists and is tracked.
if [ ! -f "$TEST_FILE" ]; then
  echo "Creating $TEST_FILE for benchmark"
  echo "export const BENCHMARK = 1;" > "$TEST_FILE"
  git add "$TEST_FILE"
else
  echo "// benchmark touch $(date +%s)" >> "$TEST_FILE"
  git add "$TEST_FILE"
fi

log_step "Git status before benchmark commit"
git status --short

log_step "1. npx lint-staged --debug (cold, single staged file)"
run_timed "lint-staged-debug" npx lint-staged --debug

log_step "2. npx eslint --cache on single staged file"
run_timed "eslint-single" npx eslint --cache "$TEST_FILE"

log_step "3. npx eslint --cache on full src/"
run_timed "eslint-full" npx eslint --cache src/

log_step "4. npx prettier --cache --write single file"
run_timed "prettier-single" npx prettier --cache --write "$TEST_FILE"

log_step "5. git add (after prettier)"
run_timed "git-add" git add "$TEST_FILE"

log_step "6. Full git commit WITH Husky (single file)"
run_timed "git-commit-husky" git commit -m "perf: benchmark commit with husky"

# Add another tiny change for the no-verify comparison.
echo "// benchmark no-verify $(date +%s)" >> "$TEST_FILE"
git add "$TEST_FILE"

log_step "7. Full git commit WITHOUT Husky (HUSKY=0 --no-verify)"
run_timed "git-commit-no-verify" sh -c 'HUSKY=0 git commit --no-verify -m "perf: benchmark commit no-verify"'

# ---------------------------------------------------------------------------
# Docker build benchmark
# ---------------------------------------------------------------------------

log_section "DC-1: Docker Build Benchmark"

log_step "Dockerfile .env references (should be empty)"
grep -n "\.env" Dockerfile || echo "No .env references found in Dockerfile (good)"

log_step ".dockerignore env exclusions"
grep -n "\.env" .dockerignore || echo "No .env exclusions found in .dockerignore (check manually)"

log_step "Docker build with plain progress (timeout 30 min)"
TIMEOUT_CMD=""
if command -v timeout >/dev/null 2>&1; then
  TIMEOUT_CMD="timeout 1800"
elif command -v gtimeout >/dev/null 2>&1; then
  TIMEOUT_CMD="gtimeout 1800"
else
  echo "WARNING: 'timeout' command not found. Running docker build without timeout."
fi
run_timed "docker-build" $TIMEOUT_CMD docker build . --tag "partspeddle-fe:benchmark-$(date +%Y%m%d-%H%M%S)" --progress=plain

# ---------------------------------------------------------------------------
# Deployment platform status
# ---------------------------------------------------------------------------

log_section "DC-4: Deployment Platform Status"

log_step "Fly apps list"
flyctl apps list 2>/dev/null || echo "flyctl apps list: failed (auth?)"

log_step "Fly staging app status"
flyctl status -a vintrack-stage 2>/dev/null || echo "flyctl status vintrack-stage: failed"

log_step "Fly production app status"
flyctl status -a vintrack-prod 2>/dev/null || echo "flyctl status vintrack-prod: failed"

log_step "Fly staging secrets (names only, values redacted)"
flyctl secrets list -a vintrack-stage 2>/dev/null | awk 'NR==1 || NF==0 {print} NR>1 && NF>0 {print $1}' || echo "flyctl secrets list vintrack-stage: failed"

log_step "Fly production secrets (names only, values redacted)"
flyctl secrets list -a vintrack-prod 2>/dev/null | awk 'NR==1 || NF==0 {print} NR>1 && NF>0 {print $1}' || echo "flyctl secrets list vintrack-prod: failed"

log_step "Supabase projects list"
supabase projects list 2>/dev/null || echo "supabase projects list: failed (auth?)"

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------

log_section "Benchmark Complete"
echo "Review the log above for timer results."
echo "If the docker build timed out, consider re-running with:"
echo "  docker build . --tag partspeddle-fe:benchmark-warm --progress=plain"
echo "after the dependency cache is warm."
