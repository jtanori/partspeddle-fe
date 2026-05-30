# Project Conventions

## Supabase Workflow
- **Strategy**: Remote-First.
- **Workflow**:
  1. Make schema changes via the Remote Supabase Dashboard SQL Editor.
  2. Manually document these changes by adding new migration files to `supabase/migrations/` to keep the repo in sync with the remote schema.
  3. Commit these migration files to Git.
- **Constraint**: Avoid CLI commands (`supabase db pull`, `db push`) that require a running Docker daemon.
