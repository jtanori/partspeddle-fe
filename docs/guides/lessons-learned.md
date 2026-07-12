# LESSONS LEARNED

This document captures critical architectural and procedural insights for future reference.

# PDP LEARNING

This section captures insights gained during the Product Detail Page (PDP) modernization project.

## 1. Architectural Lessons

- **Domain-First, UI-Second**: Defining Domain/ViewModel contracts _before_ building UI is non-negotiable. It decouples the presentation layer from the database and prevents costly refactors when schema changes occur.
- **The ViewModelBuilder Pattern**: The `ViewModelBuilder` is not just an adapter; it is the source of truth for business logic, aggregation, and formatting. By centralizing this logic here, UI components remain purely presentational ("dumb").
- **State as a Domain Concept**: Inventory, pricing variations, and fitment confidence must be modeled as first-class domain concepts (enums/objects) rather than booleans to ensure the system scales with marketplace complexity.

## 2. Process Lessons

- **TDD as an Architectural Guardrail**: Red-Green-Refactor was the primary tool for maintaining structural integrity during infrastructure migrations. It forced us to clarify the component interface _before_ implementation, preventing structural bloat.
- **Strict Linting & Discipline**: The "No Broad Search" mandate and adherence to linting hooks prevented repository bloat and hidden breakages. Enforcing these early is more effective than attempting to clean up large swaths of debt later.
- **Visual Data Gathering**: Methodical gathering of UI specifications (tokens, states, hierarchy) _before_ implementing reduces ambiguity and rework. The standardized template successfully bridged the gap between mockup and component implementation.

## 3. Infrastructure Lessons

- **Infrastructure Migration Phasing**: Modernizing infrastructure (like migrating Tailwind from Vite to native PostCSS) is a high-risk task. It must be isolated into a specific phase and verified before functional feature implementation begins.
- **Avoiding "Big-Bang" Merges**: Merging massive, multi-purpose branches is a primary cause of regression and "lost work" perception. Future work must be broken into granular, verifiable, and focused PRs.

## 4. Operational Hygiene

- **Artifact Control**: Regular audits and removal of temporary diagnostic files, logs, and unused scripts are critical to maintaining repository health.
- **Standardized Planning**: Adopting the standardized planning template (Vision ➝ Architecture ➝ Phased Implementation ➝ Promotion Gates) resulted in clearer requirements and higher agent performance.

## 5. Operational & Tooling Lessons

- **`rtk proxy` for Observability**: When executing commands that generate large volumes of output or require strict output capture, `rtk proxy` is essential to prevent token overhead and ensure the agent correctly monitors execution stdout/stderr.
- **`npx` as the Fallback**: If the proxy or global tool execution fails, falling back to `npx <command>` directly in a shell command is the definitive way to confirm if the tool exists and is executable in the current environment.
- **The "Step Down" Principle**: When automated debugging steps (like sub-agent invocations or sequential shell commands) fail repeatedly or behave unpredictably, stop, pause execution, and ask the user for manual verification or intervention. Never force a path that is clearly unstable.
- **Git Safety First**: Never perform complex refactoring or file deletion without staging and committing stable states _before_ the next potentially destructive action. Always verify file existence (`ls -l`, `cat`) before assuming a file is safe to delete or edit.

## 6. Composition & Integration Lessons

- **The "Glue" Layer Risk**: Treating the orchestration layer (Server Component page) as an afterthought causes architectural leaks, forcing business logic back into UI components and creating invalid dependencies between raw DB types and presentational components.
- **Visual Fidelity as a TDD Constraint**: TDD ensures functional correctness, but it does not guarantee visual fidelity. Component visual specifications must be defined and strictly adhered to during implementation to prevent the "functional but aesthetically hollow" syndrome.
- **Design System First**: If styling tokens (colors, spacing, typography) are not implemented _before_ component implementation, the code rapidly accumulates technical debt via hardcoded values. Refactoring hardcoded values to tokens is exponentially more expensive than using them from the start.
