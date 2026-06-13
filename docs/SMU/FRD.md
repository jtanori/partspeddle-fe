# Secret Management Utility (SMU)

## Functional Requirements Document (FRD)

### Version

1.0

### Purpose

The Secret Management Utility (SMU) provides a secure command-line interface for discovering, auditing, synchronizing, and removing secrets across GitHub Actions and Supabase environments.

The utility shall provide operators with visibility into secret usage before any modification occurs.

---

# FR-001 Secret Discovery

The system shall discover secrets from:

* GitHub Actions repositories
* Supabase project secrets
* Local .env files

The system shall display discovered secrets in an interactive searchable interface.

---

# FR-002 Secret Removal

The system shall allow operators to:

* Remove individual GitHub secrets
* Remove individual Supabase secrets
* Remove multiple secrets simultaneously

The system shall require confirmation before removal.

---

# FR-003 Secret Synchronization

The system shall support:

* GitHub-only synchronization
* Supabase-only synchronization
* Combined synchronization

The source of truth shall be the specified .env file.

---

# FR-004 Repository Secret Usage Analysis

The system shall scan:

* .github/workflows
* supabase/functions

The scan shall identify:

* Secret name
* File path
* File name
* Line number
* Platform association

---

# FR-005 Secret Usage Report

The system shall generate a report containing:

* Secret name
* Reference count
* GitHub references
* Supabase references
* Referencing file paths
* Referencing line numbers

---

# FR-006 Missing Secret Detection

The system shall identify:

* Referenced secrets not present in .env
* Referenced secrets not present remotely

---

# FR-007 Unused Secret Detection

The system shall identify secrets present in:

* GitHub
* Supabase
* .env

that are not referenced within the repository.

---

# FR-008 Interactive Selection

The system shall provide:

* Searchable selection
* Multi-selection
* Keyboard navigation
* Cancellation support

The interface shall remain usable with more than 1,000 secrets.

---

# FR-009 Deployment Plan Generation

Before updating secrets, the system shall generate a deployment plan containing:

* Target platforms
* Selected secrets
* Source file
* Operation summary

The operator must explicitly confirm the plan before any API calls occur.

---

# FR-010 Operator Confirmation

No destructive operation shall occur without explicit operator confirmation.

---

# FR-011 Audit Logging

The system shall record:

* Timestamp
* Operation type
* Target platform
* Secret names affected

Secret values shall never be logged.

---

# FR-012 Failure Reporting

The system shall report:

* Authentication failures
* Dependency failures
* API failures
* Partial synchronization failures

with actionable remediation guidance.

---

# FR-013 Operator Documentation (Help)

The system shall provide a comprehensive help system accessible via --help, -h, or help. 
This documentation shall include usage instructions, requirements, workflow descriptions, and safety controls.
The system shall also provide version information via --version.

---

# FR-015 High-Stakes Confirmation

The system shall require a 3-digit alphanumeric confirmation code before executing any deletion or synchronization operation. 
The system shall generate a random code and display it in a high-visibility, large-scale format. 
The operator must correctly type the code to proceed. Failure to provide the correct code shall result in immediate operation abort.

