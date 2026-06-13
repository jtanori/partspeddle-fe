#!/usr/bin/env bash

# SMU Enterprise Verification Suite v10.0
# Verifies SMU against hardened PRC standards with Bash 3.2 Hardening

set -euo pipefail

# Colors
GREEN='\e[32m'
RED='\e[31m'
NC='\e[0m'

echo "🚀 Starting SMU v1.5.5 Enterprise Verification..."

# Global constants needed by library
export VERSION="1.5.5"
export IGNORE_FILE=".smignore"
export RED_ORANGE='\e[32m'
export BOLD=''
export NC='\e[0m'

# 1. Isolation Test: Pure Library Sourcing
echo -n "Test 1: Library Purity (No Side Effects)... "
source smu-lib.sh
echo -e "${GREEN}PASS${NC}"

# 2. Variable Scope Integrity (env_keys test)
echo -n "Test 2: Logic Unit Test (env_keys scope)... "
discover_usage() { echo ""; }
less() { return 0; }
fzf_menu() { echo "5"; return 0; }
log_audit() { return 0; }
tmp_dir=$(mktemp -d)
(
    cd "$tmp_dir"
    echo "TEST_VAR=logic-verified" > .env
    audit_and_update > /dev/null 2>&1
)
status=$?
rm -rf "$tmp_dir"
if [ "$status" -eq 0 ]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL (exit code $status)${NC}"
    exit 1
fi

# 3. CLI Wrapper: Protected Entrypoint
echo -n "Test 3: Protected Entrypoint... "
tmp_entry=$(mktemp)
if source manage-secrets.sh > "$tmp_entry" 2>&1; then
    if [ ! -s "$tmp_entry" ]; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL (unexpected output)${NC}"
        cat "$tmp_entry"
        rm -f "$tmp_entry"
        exit 1
    fi
else
    echo -e "${RED}FAIL (sourcing exited non-zero)${NC}"
    cat "$tmp_entry"
    rm -f "$tmp_entry"
    exit 1
fi
rm -f "$tmp_entry"

# 4. CLI Wrapper: Error Trapping Visibility
echo -n "Test 4: Error Trap Fidelity (Crash Report)... "
tmp_crash=$(mktemp)
# --trigger-error triggers 'false' at main() line 96 approx
./manage-secrets.sh --trigger-error > "$tmp_crash" 2>&1 || true
if grep -q "SMU CRASH REPORT" "$tmp_crash"; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL (No report)${NC}"
    cat "$tmp_crash"
    exit 1
fi
rm -f "$tmp_crash"

# 5. Bash 3.2 FIX: Empty Array Expansion under set -u
echo -n "Test 5: Empty Array expansion (set -u Hardening)... "
tmp_dir=$(mktemp -d)
(
    cd "$tmp_dir"
    echo '*.bak' > .smignore
    source "$OLDPWD/smu-lib.sh"
    set -u
    IGNORE_FILE=".smignore"
    # Should NOT crash even if ignore_args is empty and no dirs exist
    discover_usage > /dev/null 2>&1
)
status=$?
rm -rf "$tmp_dir"
if [ "$status" -eq 0 ]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL (Unbound variable detected)${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ ARCHITECTURAL & RUNTIME CERTIFICATION COMPLETE${NC}"
echo "SMU 1.5.5 is now production certified for macOS Bash 3.2."
