# Secret Management Utility (SMU)

## Technical Requirements Document (TRD)

### Version

1.0

---

# Architecture

The utility shall be implemented as a POSIX-compatible shell application targeting:

* Linux
* macOS

Primary shell:

* Bash 3.2+
* Bash 4+
* Bash 5+

---

# Dependencies

Required:

* gh
* supabase
* jq
* fzf

Optional:

* shellcheck
* shfmt

---

# Secret Sources

GitHub:

* gh secret list
* gh secret set
* gh secret delete

Supabase:

* supabase secrets list
* supabase secrets set
* supabase secrets unset

Local:

* .env

---

# User Interface

Interactive selection shall be implemented using fzf.
Reporting shall be implemented using less.

Requirements:

* Multi-select support
* Search support
* Keyboard navigation
* Cancellation support
* Preview support
* --help support for operator documentation
* --version support for version tracking

---

# Excluded Files (.smignore)

The utility shall read exclusion patterns from a .smignore file located in the project root.

Requirements:

* Support for line-separated glob patterns.
* Support for comments (lines starting with #).
* Support for directory exclusion.
* Default exclusions if the file is missing: *.bak, *.tmp, node_modules, .git, .next, dist.

---

# Parsing Requirements

Repository scanning shall extract:

GitHub:

* secrets.NAME
* secrets['NAME']
* secrets["NAME"]

Supabase:

* Deno.env.get("NAME")
* Deno.env.get('NAME')

Extraction shall include:

* file path
* line number
* secret name

Excluded Patterns:

* *.bak
* *.tmp
* node_modules/
* .git/
* .next/
* dist/

---

# Security Requirements

Secret values shall never:

* be echoed
* be logged
* be written to temporary files

The utility shall only manipulate secret names during discovery.

---

# Authentication Requirements

Startup validation shall verify:

* gh authentication
* supabase authentication

Execution shall halt on authentication failure.

---

# Error Handling

The utility shall:

* distinguish cancellation from failure
* detect API errors
* detect malformed JSON
* detect missing dependencies

All failures shall return non-zero exit codes.

---

# Logging

Audit logs shall include:

* operation
* timestamp
* target
* secret names

Audit logs shall exclude:

* secret values
* environment contents

---

# Testing Requirements

The utility shall pass:

* shellcheck
* shfmt validation
* dependency validation
* authentication validation
* dry-run validation
* destructive-operation validation

---

# Performance Requirements

The system shall:

* support 1,000+ secrets
* support 10,000+ repository references
* complete repository scans in under 10 seconds for repositories below 500 MB

---

# Confirmation Protocol

The utility shall implement a random 3-digit alphanumeric challenge-response mechanism.

Requirements:

* Color: Red-Orange (ANSI \e[38;5;202m or \e[31m).
* Border: Heavy double-line or bold ASCII border.
* Format: Large-scale characters or bold highlighted block.
* Logic: Case-sensitive comparison; block execution on mismatch.

