# Lessons Learned: PDP Modernization

This document captures critical architectural and procedural insights gained during the Product Detail Page (PDP) modernization project. These lessons will serve as a foundational guide for future domain modernization initiatives.

## 1. Architectural Lessons
- **Domain-First, UI-Second**: Defining Domain/ViewModel contracts *before* building UI is non-negotiable. It decouples the presentation layer from the database and prevents costly refactors when schema changes occur.
- **The ViewModelBuilder Pattern**: The `ViewModelBuilder` is not just an adapter; it is the source of truth for business logic, aggregation, and formatting. By centralizing this logic here, UI components remain purely presentational ("dumb").
- **State as a Domain Concept**: Inventory, pricing variations, and fitment confidence must be modeled as first-class domain concepts (enums/objects) rather than booleans to ensure the system scales with marketplace complexity.

## 2. Process Lessons
- **TDD as an Architectural Guardrail**: Red-Green-Refactor was the primary tool for maintaining structural integrity during infrastructure migrations. It forced us to clarify the component interface *before* implementation, preventing structural bloat.
- **Strict Linting & Discipline**: The "No Broad Search" mandate and adherence to linting hooks prevented repository bloat and hidden breakages. Enforcing these early is more effective than attempting to clean up large swaths of debt later.
- **Visual Data Gathering**: Methodical gathering of UI specifications (tokens, states, hierarchy) *before* implementing reduces ambiguity and rework. The standardized template successfully bridged the gap between mockup and component implementation.

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
- **Git Safety First**: Never perform complex refactoring or file deletion without staging and committing stable states *before* the next potentially destructive action. Always verify file existence (`ls -l`, `cat`) before assuming a file is safe to delete or edit.
