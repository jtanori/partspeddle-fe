#!/bin/bash
# Emergency Dependency & Build Stabilization Script
# PartsPeddle Marketplace — pnpm Clean-Room Rebuild
set -euxo pipefail

echo "=== Phase 1: Atomic Purge of All Build Artifacts & Stores ==="
rm -rf node_modules
rm -rf .next
rm -rf dist
rm -rf .pnpm-store
rm -rf .turbo 2>/dev/null || true

echo "=== Phase 2: Deterministic pnpm Install (Strict Isolated Store) ==="
pnpm install

echo "=== Phase 3: Verify Virtual Store Integrity ==="
# Critical packages that must exist in the content-addressable .pnpm store
ls node_modules/.pnpm/tailwindcss@*/node_modules/tailwindcss/package.json >/dev/null
ls node_modules/.pnpm/tw-animate-css@*/node_modules/tw-animate-css/dist/tw-animate.css >/dev/null
ls node_modules/.pnpm/next@*/node_modules/next/package.json >/dev/null
ls node_modules/.pnpm/react@*/node_modules/react/package.json >/dev/null
ls node_modules/.pnpm/@tailwindcss+postcss@*/node_modules/@tailwindcss/postcss/package.json >/dev/null
ls node_modules/.pnpm/postcss@*/node_modules/postcss/package.json >/dev/null

echo "=== Phase 4: Verify Top-Level Symlinks Are Not Phantom/Empty ==="
# These must be real directories or valid symlinks pointing into .pnpm/
test -d node_modules/tailwindcss
test -d node_modules/tw-animate-css
test -d node_modules/next
test -d node_modules/react
test -d node_modules/@tailwindcss/postcss
test -d node_modules/postcss

echo "=== Phase 5: Production Build Verification ==="
pnpm build

echo "=== RESTORATION COMPLETE ==="
echo "All dependencies resolved. Build succeeded."
