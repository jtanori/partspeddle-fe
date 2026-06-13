#!/usr/bin/env bash

# Secret Management Utility (SMU)
# Version: 1.5.5
# Requires: smu-lib.sh, gh, supabase, jq, fzf, less

# --- High-Stakes Shell Hardening ---
set -Eeuo pipefail
IFS=$'\n\t'

# Source the library
# shellcheck disable=SC1091
source smu-lib.sh

# Debug mode
DEBUG=${DEBUG:-0}
[[ "$DEBUG" == "1" ]] && set -x

# Global constants/config
VERSION="1.5.5"
AUDIT_LOG="logs/smu-audit.log"
IGNORE_FILE=".smignore"
RED_ORANGE='\e[38;5;202m'
BOLD='\e[1m'
NC='\e[0m'

# --- Local Error Handler ---
# We pass the exit status explicitly to avoid Bash 3.2 'local' quirks
error_handler() {
    local error_status=$1
    local line_no=$2
    local failed_command="${BASH_COMMAND}"

    # Only suppress SIGINT/ESC (130)
    if [ "$error_status" -eq 130 ]; then
        return 0
    fi
    
    printf "\n" >&2
    printf "==================================================\n" >&2
    printf "⚠️  SMU CRASH REPORT\n" >&2
    printf "==================================================\n" >&2
    printf "Exit Code : %s\n" "$error_status" >&2
    printf "Line      : %s\n" "$line_no" >&2
    printf "Command   : %s\n" "$failed_command" >&2
    printf "==================================================\n" >&2
    
    return 0
}

# Propagate ERR trap and pass the exit code ($?) immediately
trap 'error_handler $? ${LINENO}' ERR

# --- Documentation ---
show_help() {
cat <<EOF
Secret Management Utility (SMU)

USAGE
    manage-secrets.sh [OPTION]

OPTIONS
    -h, --help      Show this help message.
    --version       Show version information.

DESCRIPTION
    Interactive utility for managing GitHub Actions and
    Supabase project secrets with Audit-Plan-Execute workflow.

CONFIGURATION
    Requires SUPABASE_PROJECT_REF in .env or environment.

VERSION: $VERSION
EOF
}

# --- Pre-flight ---
check_deps() {
    local missing=()
    for cmd in gh supabase jq fzf less; do
        if ! command -v "$cmd" >/dev/null 2>&1; then missing+=("$cmd"); fi
    done
    if [ "${#missing[@]}" -gt 0 ]; then
        echo "❌ Missing dependencies: ${missing[*]}" >&2
        exit 2
    fi
    return 0
}

log_audit() { 
    mkdir -p logs
    printf "[%s] OP:%s | TARGET:%s | SECRETS:%s\n" "$(date +'%Y-%m-%d %H:%M:%S')" "$1" "$2" "$3" >> "$AUDIT_LOG"
}

# --- Main Entry Point ---
main() {
    case "${1:-}" in
        -h|--help|help) show_help; exit 0 ;;
        --version) echo "$VERSION"; exit 0 ;;
        --trigger-error) false ;; # Hook for PRC
    esac

    check_deps
    if ! check_infra; then exit 3; fi

    while true; do
        local menu_choice
        if ! menu_choice=$(printf "1) Remove\n2) Audit & Update\n3) Report\n4) Exit" | fzf_menu "SMU Main Menu > " | cut -d')' -f1); then
            exit 0
        fi
        
        case "$menu_choice" in
            1) 
                local sub
                if ! sub=$(printf "1) GitHub Secrets\n2) Supabase Secrets\n3) Back" | fzf_menu "Removal Menu > " | cut -d')' -f1); then
                    continue
                fi
                if [[ "$sub" == "1" ]]; then
                    remove_secrets "GitHub" list_gh_secrets
                elif [[ "$sub" == "2" ]]; then
                    remove_secrets "Supabase" list_sb_secrets
                fi
                ;;
            2) audit_and_update ;;
            3) generate_report ;;
            4|"") exit 0 ;;
        esac
    done
}

# Protected entrypoint
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
    main "$@"
fi
