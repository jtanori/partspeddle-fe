#!/bin/bash
# platform/scripts/archive/verify-search.sh

echo "Running search domain verification..."

# 1. Typecheck
echo "--- Typechecking search domain ---"
npx tsc --noEmit \
  "src/app/(public)/search/page.tsx" \
  src/components/search/**/* \
  src/services/search/**/* \
  src/hooks/search/**/*

# 2. Lint
echo "--- Linting search domain ---"
npx eslint \
  "src/app/(public)/search/page.tsx" \
  src/components/search/**/* \
  src/services/search/**/* \
  src/hooks/search/**/*

# 3. Test
echo "--- Running search domain tests ---"
npx vitest run src/components/search/
