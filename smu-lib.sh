#!/usr/bin/env bash

# Secret Management Utility Core Library
# Version: 1.5.5
# This file should only contain function definitions.

get_ignore_args() {
    if [[ ! -f "$IGNORE_FILE" ]]; then
        printf '%s\n' '--exclude=*.bak' '--exclude=*.tmp' '--exclude-dir=node_modules' '--exclude-dir=.git' '--exclude-dir=.next' '--exclude-dir=dist'
        return 0
    fi
    while IFS= read -r line || [[ -n "$line" ]]; do
        [[ "$line" =~ ^#.*$ ]] || [[ -z "$line" ]] && continue
        if [[ "$line" == */ ]]; then
            echo "--exclude-dir=${line%/}"
        else
            echo "--exclude=$line"
        fi
    done < "$IGNORE_FILE"
}

_discover_platform() {
    local file="$1"
    case "$file" in
        .github/workflows/*) echo "github" ;;
        supabase/functions/*) echo "supabase" ;;
        *) echo "app" ;;
    esac
}

discover_usage() {
    [[ -f .env ]] || return 0

    local search_paths=()
    [ -d .github/workflows ] && search_paths+=(".github/workflows")
    [ -d supabase/functions ] && search_paths+=("supabase/functions")
    [ -d src ] && search_paths+=("src")
    [ -d components ] && search_paths+=("components")
    [ -d lib ] && search_paths+=("lib")

    for f in server.ts server.js vite.config.ts vite.config.js next.config.ts next.config.js; do
        [ -f "$f" ] && search_paths+=("$f")
    done

    if [ ${#search_paths[@]} -eq 0 ]; then
        return 0
    fi

    local pattern=""
    while IFS='=' read -r key _; do
        [[ "$key" =~ ^#.*$ ]] || [[ -z "$key" ]] && continue
        key="${key#export }"
        key="${key%"${key##*[![:space:]]}"}"
        [[ -z "$key" ]] && continue
        if [[ -n "$pattern" ]]; then
            pattern="${pattern}|${key}"
        else
            pattern="$key"
        fi
    done < .env

    if [[ -z "$pattern" ]]; then
        return 0
    fi

    grep -IRno -E "$pattern" "${search_paths[@]}" 2>/dev/null | \
    while IFS=: read -r file line match; do
        local plat
        plat=$(_discover_platform "$file")
        printf "%s|%s|%s|%s\n" "$match" "$plat" "$file" "$line"
    done || true
}

fzf_menu() (
    set +e
    local out
    out=$(fzf --layout=reverse --height=15 --border --cycle --prompt="$1" --header='↑↓ navigate | Search | ENTER confirm' --bind='j:down,k:up')
    local status=$?
    [[ $status -eq 0 ]] && printf '%s\n' "$out"
    return "$status"
)

select_secrets_fzf() (
    set +e
    local result
    result=$($1 | sort -u | fzf --multi --layout=reverse --height=80% --border --cycle --prompt="$2" --header="TAB=toggle | ENTER=confirm | ESC=cancel" --bind='j:down,k:up')
    local status=$?
    [[ $status -eq 0 && -n "$result" ]] && printf '%s\n' "$result"
    return "$status"
)

check_infra() {
    if [[ -f .env ]]; then
        set +u; set -a; . .env; set +a; set -u
    fi

    PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
    if [[ -z "$PROJECT_REF" ]]; then
        echo "❌ Missing SUPABASE_PROJECT_REF." >&2
        return 1
    fi

    if ! gh auth status >/dev/null 2>&1; then echo "❌ GitHub not authenticated." >&2; return 1; fi
    if ! supabase projects list >/dev/null 2>&1; then echo "❌ Supabase not authenticated." >&2; return 1; fi
    return 0
}

list_gh_secrets() {
    gh secret list --json name -q '.[].name' 2>/dev/null || true
}

list_sb_secrets() {
    supabase secrets list --project-ref "$PROJECT_REF" 2>/dev/null | awk 'NR>1 {print $1}' || true
}

generate_confirmation() {
    local code
    local attempts=0
    local max_attempts=3

    while [ "$attempts" -lt "$max_attempts" ]; do
        code=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 5 || true)
        code=$(echo "$code" | tr '[:lower:]' '[:upper:]')
        [[ -z "$code" ]] && return 1

        printf "\n${RED_ORANGE}${BOLD}"
        printf "╔════════════════════════════════════════════╗\n"
        printf "║                                            ║\n"
        printf "║   HIGH-STAKES CONFIRMATION REQUIRED        ║\n"
        printf "║                                            ║\n"
        printf "║               [  %s  ]                ║\n" "$code"
        printf "║                                            ║\n"
        printf "╚════════════════════════════════════════════╝\n${NC}\n"

        printf "Enter code (or Ctrl+C to cancel): "
        local input; read -r input || return 1
        [[ "$input" == "$code" ]] && return 0

        echo "❌ Mismatched code."
        attempts=$((attempts + 1))
    done

    echo "🚫 Maximum attempts reached. Operation aborted."
    return 1
}

generate_report() {
    [[ -f .env ]] || { echo "❌ .env not found."; return 1; }

    local env_keys=()
    while IFS='=' read -r key _; do
        [[ "$key" =~ ^#.*$ ]] || [[ -z "$key" ]] && continue
        key="${key#export }"
        key="${key%"${key##*[![:space:]]}"}"
        env_keys+=("$key")
    done < .env

    echo "🔍 Scanning codebase for secrets usage..."
    local usage_report
    usage_report=$(discover_usage | sort -u) || {
        echo "❌ Secret discovery failed." >&2
        return 1
    }

    local report_file; report_file=$(mktemp)
    {
        printf "SECRET USAGE REPORT\n====================\n"

        printf "\n----- SECRETS IN CI/CD -----\n"
        local found_any=0
        for key in "${env_keys[@]}"; do
            local matches
            matches=$(echo "$usage_report" | grep "^$key|github|")
            if [ -n "$matches" ]; then
                found_any=1
                printf "\n%s\n" "$key"
                echo "$matches" | while IFS='|' read -r _ _ file line; do
                    printf "  %s:%s\n" "$file" "$line"
                done
            fi
        done
        if [ "$found_any" -eq 0 ]; then
            printf "\n  (none found)\n"
        fi

        printf "\n----- SECRETS IN SUPABASE EDGE FUNCTIONS -----\n"
        found_any=0
        for key in "${env_keys[@]}"; do
            local matches
            matches=$(echo "$usage_report" | grep "^$key|supabase|")
            if [ -n "$matches" ]; then
                found_any=1
                printf "\n%s\n" "$key"
                echo "$matches" | while IFS='|' read -r _ _ file line; do
                    printf "  %s:%s\n" "$file" "$line"
                done
            fi
        done
        if [ "$found_any" -eq 0 ]; then
            printf "\n  (none found)\n"
        fi

        printf "\n----- UNUSED IN .env -----\n"
        found_any=0
        for key in "${env_keys[@]}"; do
            if ! echo "$usage_report" | grep -q "^$key|"; then
                found_any=1
                printf "  ⚠️ %s\n" "$key"
            fi
        done
        if [ "$found_any" -eq 0 ]; then
            printf "  (all secrets are used)\n"
        fi
    } > "$report_file"

    less -R "$report_file" || true
    rm -f "$report_file"
}

remove_secrets() {
    local platform=$1
    local source_func=$2
    local selected_input
    if ! selected_input=$(select_secrets_fzf "$source_func" "🔑 Remove $platform Secrets > "); then return 0; fi

    local SELECTED_SECRETS=()
    while IFS= read -r line; do
        [[ -n "$line" ]] && SELECTED_SECRETS+=("$line")
    done <<< "$selected_input"

    printf "\nSelected secrets for deletion:\n"
    if [ ${#SELECTED_SECRETS[@]} -gt 0 ]; then
        for s in "${SELECTED_SECRETS[@]}"; do printf "  - %s\n" "$s"; done
    fi

    if generate_confirmation; then
        local all_success=1
        if [ ${#SELECTED_SECRETS[@]} -gt 0 ]; then
            for secret in "${SELECTED_SECRETS[@]}"; do
                if [[ "$platform" == "GitHub" ]]; then
                    if gh secret delete "$secret"; then
                        printf "✅ Deleted %s (GH)\n" "$secret"
                    else
                        all_success=0
                    fi
                else
                    if supabase secrets unset "$secret" --project-ref "$PROJECT_REF"; then
                        printf "✅ Deleted %s (SB)\n" "$secret"
                    else
                        all_success=0
                    fi
                fi
            done
            if [ "$all_success" -eq 1 ]; then
                log_audit "DELETE" "$platform" "${SELECTED_SECRETS[*]}"
            else
                echo "⚠️ Some deletions failed. Audit log not written." >&2
            fi
        fi
    else
        echo "🚫 Operation aborted by user." >&2
    fi
}

# --- Push helper ---
_push_secrets() {
    local platform=$1
    shift
    local keys=("$@")
    local all_success=1

    if [ ${#keys[@]} -eq 0 ]; then
        echo "No secrets selected." >&2
        return 1
    fi

    for key in "${keys[@]}"; do
        local val
        val=$(awk -F= -v k="$key" '$1==k {print substr($0,index($0,"=")+1)}' .env | head -n 1 | sed 's/^"//;s/"$//;s/'"'"'//g')
        if [[ -z "$val" ]]; then
            echo "⚠️ Skip $key: no value found in .env" >&2
            continue
        fi

        if [[ "$platform" == "GitHub" ]]; then
            if gh secret set "$key" --body "$val"; then
                printf "✅ Set %s (GH)\n" "$key"
            else
                echo "❌ Failed to set $key (GH)" >&2
                all_success=0
            fi
        else
            if supabase secrets set "$key=$val" --project-ref "$PROJECT_REF"; then
                printf "✅ Set %s (SB)\n" "$key"
            else
                echo "❌ Failed to set $key (SB)" >&2
                all_success=0
            fi
        fi
    done

    if [ "$all_success" -eq 1 ]; then
        log_audit "SYNC" "$platform" "${keys[*]}"
        return 0
    else
        return 1
    fi
}

# --- Interactive push flow ---
_interactive_push() {
    local platform=$1
    local required_label=$2

    # Read .env keys
    local env_keys=()
    while IFS='=' read -r key _; do
        [[ "$key" =~ ^#.*$ ]] || [[ -z "$key" ]] && continue
        key="${key#export }"
        key="${key%"${key##*[![:space:]]}"}"
        env_keys+=("$key")
    done < .env

    if [ ${#env_keys[@]} -eq 0 ]; then
        echo "❌ No keys found in .env." >&2
        return 2
    fi

    # Discover usage
    local usage_report
    usage_report=$(discover_usage | sort -u) || usage_report=""

    # Categorize
    local plat_filter=""
    [[ "$platform" == "GitHub" ]] && plat_filter="github"
    [[ "$platform" == "Supabase" ]] && plat_filter="supabase"

    local required_str=""
    local optional_str=""

    for key in "${env_keys[@]}"; do
        if echo "$usage_report" | grep -q "^$key|$plat_filter|"; then
            required_str=$(printf "%s\n%s" "$required_str" "$key")
        else
            optional_str=$(printf "%s\n%s" "$optional_str" "$key")
        fi
    done
    required_str=$(echo "$required_str" | sed '/^$/d')
    optional_str=$(echo "$optional_str" | sed '/^$/d')

    # Start with required selected
    local selected_str="$required_str"

    while true; do
        printf "\n\n"
        echo "=== PUSH TO $platform ==="
        echo ""

        local i=1
        local all_secrets=""

        if [ -n "$required_str" ]; then
            echo "$required_label"
            while IFS= read -r key; do
                all_secrets=$(printf "%s\n%s" "$all_secrets" "$key")
                if echo "$selected_str" | grep -qxF "$key"; then
                    printf "  [x] %2d) %s\n" "$i" "$key"
                else
                    printf "  [ ] %2d) %s\n" "$i" "$key"
                fi
                i=$((i + 1))
            done <<< "$required_str"
            echo ""
        fi

        if [ -n "$optional_str" ]; then
            echo "Optional:"
            while IFS= read -r key; do
                all_secrets=$(printf "%s\n%s" "$all_secrets" "$key")
                if echo "$selected_str" | grep -qxF "$key"; then
                    printf "  [x] %2d) %s\n" "$i" "$key"
                else
                    printf "  [ ] %2d) %s\n" "$i" "$key"
                fi
                i=$((i + 1))
            done <<< "$optional_str"
            echo ""
        fi

        echo "Commands: (a) select all  (d) deselect all  (number) toggle  (y) continue  (c) cancel"
        read -r -p "Selection: " choice

        case "$choice" in
            a)
                selected_str="$required_str"
                if [ -n "$optional_str" ]; then
                    selected_str=$(printf "%s\n%s" "$selected_str" "$optional_str")
                fi
                ;;
            d)
                selected_str=""
                ;;
            c)
                return 2
                ;;
            y)
                break
                ;;
            [0-9]*)
                local target
                target=$(echo "$all_secrets" | sed -n "${choice}p")
                if [ -n "$target" ]; then
                    if echo "$selected_str" | grep -qxF "$target"; then
                        selected_str=$(echo "$selected_str" | grep -vxF "$target")
                    else
                        selected_str=$(printf "%s\n%s" "$selected_str" "$target")
                        selected_str=$(echo "$selected_str" | sed '/^$/d')
                    fi
                fi
                ;;
        esac
    done

    # Build array from selected_str
    local to_push=()
    while IFS= read -r key; do
        [ -n "$key" ] && to_push+=("$key")
    done <<< "$selected_str"

    if [ ${#to_push[@]} -eq 0 ]; then
        echo "No secrets selected."
        return 2
    fi

    # Show plan
    echo ""
    echo "=== PUSH PLAN ==="
    echo "Target: $platform"
    echo "Secrets:"
    for s in "${to_push[@]}"; do echo "  - $s"; done

    # Confirm
    if ! generate_confirmation; then
        echo "🚫 Operation aborted by user."
        return 2
    fi

    # Push
    if _push_secrets "$platform" "${to_push[@]}"; then
        echo ""
        echo "✅ Push complete."
        return 0
    else
        echo ""
        echo "❌ Some secrets failed to push."
        return 1
    fi
}

audit_and_update() {
    [[ -f .env ]] || { echo "❌ .env not found."; return 1; }

    # Skip interactive flow in non-interactive environments (tests, CI)
    if [ ! -t 0 ]; then
        return 0
    fi

    while true; do
        printf "\n\n"
        echo "=== AUDIT & UPDATE ==="
        echo ""
        echo "1) GitHub"
        echo "2) Supabase"
        echo "3) Back"
        read -r -p "Select platform (1-3): " platform_choice

        case "$platform_choice" in
            1)
                while true; do
                    if _interactive_push "GitHub" "REQUIRED BY CI/CD"; then
                        break
                    else
                        local status=$?
                        if [ "$status" -eq 2 ]; then
                            break  # user cancelled
                        fi
                        echo ""
                        echo "1) Retry"
                        echo "2) Cancel"
                        read -r -p "Choice: " retry_choice
                        [[ "$retry_choice" == "2" ]] && break
                    fi
                done
                ;;
            2)
                while true; do
                    if _interactive_push "Supabase" "REQUIRED BY SUPABASE EDGE FUNCTIONS"; then
                        break
                    else
                        local status=$?
                        if [ "$status" -eq 2 ]; then
                            break  # user cancelled
                        fi
                        echo ""
                        echo "1) Retry"
                        echo "2) Cancel"
                        read -r -p "Choice: " retry_choice
                        [[ "$retry_choice" == "2" ]] && break
                    fi
                done
                ;;
            3)
                return 0
                ;;
        esac
    done
}
