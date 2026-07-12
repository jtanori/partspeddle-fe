# Project Conventions

## Supabase Workflow

- **Strategy**: Remote-First.
- **Workflow**:
  1. Make schema changes via the Remote Supabase Dashboard SQL Editor.
  2. Manually document these changes by adding new migration files to `supabase/migrations/` to keep the repo in sync with the remote schema.
  3. Commit these migration files to Git.
- **Constraint**: Avoid CLI commands (`supabase db pull`, `db push`) that require a running Docker daemon.

## Promotion Workflow (PPSC)

- **Constraint**: No code may be promoted to `main` without a passing **Pre-Promotion Sanitization Certification (PPSC)**.
- **Zero Tolerance**: 100% test pass rate required. No "Pass with Warnings".
- **Certified Systems**: Any changes to Platinum-certified subsystems (e.g., Search Platform) must include a [`../governance/certification/evidence/certified-system-changelog.md`](../governance/certification/evidence/certified-system-changelog.md) justifying all modifications and deletions.
- **Levels**: Certification must pass both Level 1 (Sanitation) and Level 2 (Promotion).
