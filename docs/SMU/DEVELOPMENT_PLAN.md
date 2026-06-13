# SMU Development Plan
## Silent Failure Remediation — Version 1.5.4 → 1.5.5

### Status
**DRAFT** — Pending approval

---

## 1. Executive Summary

The Secret Management Utility (SMU) contains **8 distinct bugs that cause silent failures**. These range from missing function definitions and incorrect regular-expression substitutions to bash `set -e` edge cases and false-positive verification tests. The tool can hang indefinitely, skip operations without explanation, or log false success records.

This plan proposes a **targeted patch release (1.5.5)** that fixes all identified silent-failure modes without changing the public interface or UX flow.

---

## 2. Bug Register

| ID | Severity | Component | Symptom | Root Cause |
|:---|:---|:---|:---|:---|
| **SMU-001** | P1 — Core Functional Failure | `smu-lib.sh` | **Remove Secrets menu does nothing and returns to menu without error.** | `list_gh_secrets` and `list_sb_secrets` are invoked by `remove_secrets` but **never defined** in the codebase. `select_secrets_fzf` calls `"$1"`, which fails silently inside `$(…)`; the caller catches the non-zero exit and returns 0. |
| **SMU-002** | P0 — Operational Stall | `smu-lib.sh` | **`audit_and_update` and `verify-smu.sh` Test 5 hang indefinitely** (observed timeout at 60s on a 1.9GB `node_modules`). | `get_ignore_args` exits early when `.smignore` is missing. The TRD mandates default exclusions (`*.bak`, `*.tmp`, `node_modules/`, `.git/`, `.next/`, `dist/`), but these are never applied, so `grep -R` recursively scans massive directories with no feedback. |
| **SMU-003** | P2 — Data Corruption | `smu-lib.sh` | **Audit report shows filenames instead of secret names** for `secrets['NAME']` / `secrets["NAME"]` syntax. | The `sed` substitution for bracket-style secret references uses `\1|github|\1|\2` instead of `\3|github|\1|\2`. `\1` is the filename capture group, not the secret-name capture group. |
| **SMU-004** | P2 — Silent Data Loss | `smu-lib.sh` | **Empty audit report when `discover_usage` fails.** | `usage_report=$(discover_usage \| sort -u)` is a variable assignment. Under bash `set -e`, failures inside `$(…)` in an assignment context **do NOT trigger exit**, so the script continues with an empty report. |
| **SMU-005** | P1 — False Audit Records | `smu-lib.sh` | **Audit log records "DELETE" / "SYNC" success even when API calls fail.** | `log_audit` is placed inside the `if generate_confirmation; then … fi` block but **outside** the individual API-result checks. If `gh secret delete` or `supabase secrets unset` fails for any secret, the audit still claims success. |
| **SMU-006** | P2 — UX Degradation | `smu-lib.sh` | **Operations abort without explanation when confirmation code is wrong or generation fails.** | `generate_confirmation` returns 1 on mismatch, but callers (`remove_secrets`, `audit_and_update`) simply fall through the `if` block without printing an abort message to stderr. |
| **SMU-007** | P2 — Incorrect Analysis | `smu-lib.sh` | **False "unused" and "missing" secret positives** in the audit report. | `.env` parsing uses `IFS='=' read -r key _`. Lines like `export FOO=bar` parse the key as `export FOO`, which never matches usage reports. |
| **SMU-008** | P3 — Verification False Positives | `verify-smu.sh` | **Tests 2 and 3 claim PASS while not actually validating the behaviour they describe.** | Test 2 sets `ENV_FILE=.env.test` but `audit_and_update` hardcodes `.env`, so the variable is ignored; the test also does not assert the exit code. Test 3 sources `manage-secrets.sh` with `|| true`, masking real sourcing errors. Test 5 hangs because of SMU-002. |

---

## 3. Proposed Fixes

### 3.1 SMU-001 — Implement Missing Listing Functions

Add `list_gh_secrets` and `list_sb_secrets` to `smu-lib.sh`:

```bash
list_gh_secrets() {
    gh secret list --json name -q '.[].name' 2>/dev/null || true
}

list_sb_secrets() {
    supabase secrets list --project-ref "$PROJECT_REF" 2>/dev/null | awk 'NR>1 {print $1}' || true
}
```

*Files changed:* `smu-lib.sh`

---

### 3.2 SMU-002 — Enforce Default `.smignore` Exclusions

Modify `get_ignore_args` in `smu-lib.sh` to emit default exclusions when `.smignore` is absent:

```bash
get_ignore_args() {
    if [[ ! -f "$IGNORE_FILE" ]]; then
        printf '%s\n' '*.bak' '*.tmp' 'node_modules/' '.git/' '.next/' 'dist/'
        return 0
    fi
    # …existing file-parsing logic…
}
```

*Files changed:* `smu-lib.sh`

---

### 3.3 SMU-003 — Fix `sed` Capture-Group Mapping

Replace the second `sed` substitution in `discover_usage`:

```bash
sed -E 's/([^:]+):([0-9]+):.*\$\{secrets\.([A-Za-z0-9_]+)\}.*/\3|github|\1|\2/; s/([^:]+):([0-9]+):.*\$\{secrets\[[\'"']([A-Za-z0-9_]+)[\'"']\]\}.*/\3|github|\1|\2/' || true
```

*Files changed:* `smu-lib.sh`

---

### 3.4 SMU-004 — Harden Pipeline Failure Detection

Refactor `audit_and_update` to capture `discover_usage` output with explicit error checking:

```bash
local usage_report
usage_report=$(discover_usage | sort -u) || {
    echo "❌ Secret discovery failed. Aborting audit." >&2
    return 1
}
```

*Files changed:* `smu-lib.sh`

---

### 3.5 SMU-005 — Guard Audit Logging Behind API Success

Move `log_audit` inside per-secret success checks in both `remove_secrets` and `audit_and_update`. Only log after **all** secrets in the batch succeed, or log partial failures separately.

*Files changed:* `smu-lib.sh`

---

### 3.6 SMU-006 — Add User-Facing Abort Messages

After `generate_confirmation` calls, add an `else` branch:

```bash
if generate_confirmation; then
    # …operation…
else
    echo "🚫 Operation aborted by user." >&2
fi
```

*Files changed:* `smu-lib.sh`

---

### 3.7 SMU-007 — Robust `.env` Key Parsing

Strip optional `export ` prefix and inline comments before splitting on `=`:

```bash
while IFS='=' read -r key _; do
    [[ "$key" =~ ^#.*$ ]] || [[ -z "$key" ]] && continue
    key="${key#export }"
    key="${key%% }"
    env_keys+=("$key")
done < .env
```

*Files changed:* `smu-lib.sh`

---

### 3.8 SMU-008 — Harden Verification Suite

1. **Test 2:** Create a real `.env` file in a temp directory, `cd` into it, then call `audit_and_update`. Assert exit code 0 explicitly.
2. **Test 3:** Remove `|| true` from the `source manage-secrets.sh` line; assert the command succeeds with exit code 0 and produces no output.
3. **Test 5:** Add a `.smignore` or a `timeout` guard to prevent hangs. Alternatively, run `discover_usage` in an isolated temp directory with no `node_modules`.

*Files changed:* `verify-smu.sh`

---

## 4. File Impact Matrix

| File | Lines Added | Lines Removed | Nature of Change |
|:---|:---:|:---:|:---|
| `smu-lib.sh` | ~40 | ~15 | Bug fixes, new helper functions, hardened parsing |
| `manage-secrets.sh` | 0 | 0 | No changes required |
| `verify-smu.sh` | ~15 | ~8 | Harden assertions, fix false positives, add timeouts |
| `docs/SMU/PRC.md` | ~10 | ~10 | Update certification version and test results |

---

## 5. Rollback Plan

All changes are additive or corrective within existing function signatures. Rollback is a single `git checkout` of the three modified files.

---

## 6. Acceptance Criteria

- [ ] `./manage-secrets.sh --version` returns `1.5.5`.
- [ ] `bash verify-smu.sh` completes in under 10 seconds with **all tests PASS**.
- [ ] Removing secrets from GitHub and Supabase menus lists actual remote secrets.
- [ ] Audit report correctly parses `secrets['NAME']` and `secrets["NAME"]`.
- [ ] Audit report does not include `node_modules/` or `.git/` references.
- [ ] If `discover_usage` fails, the audit exits with a visible error message.
- [ ] Failed API calls do not produce false audit-log entries.
- [ ] `.env` files with `export KEY=value` parse correctly.

---

## 7. Estimation

| Phase | Effort |
|:---|:---|
| Code changes (smu-lib.sh) | 1 engineer-hour |
| Verification fixes (verify-smu.sh) | 30 minutes |
| Regression testing | 30 minutes |
| **Total** | **~2 hours** |

---

**Prepared by:** Kimi Code CLI  
**Date:** 2026-06-05  
**Target Release:** 1.5.5

---

*Awaiting approval to proceed.*
