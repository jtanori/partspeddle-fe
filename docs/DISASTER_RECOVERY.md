# VinTrack Search Platform – Disaster Recovery

## 1. Incident Response

### Severity Levels

- **SEV-1**: Production outage (Search API down).
- **SEV-2**: Search unavailable (Database or Algolia unreachable).
- **SEV-3**: Degraded indexing (Outbox backlog).
- **SEV-4**: Minor operational issue.

## 2. Disaster Recovery Procedures

### Database (Supabase)

- **Backup/Restore**: Follow Supabase project-level backup and restore procedures.
- **RPO/RTO**: Refer to Supabase service-level agreement.

### Search Layer (Algolia)

- **Full Reindex**: If index corruption is detected:
  1. Run reindexing script: `npm run search:reindex`
  2. Audit consistency: `npm run test:drift`
- **Drift Recovery**:
  1. Run `npm run audit:search-platform` to identify discrepancies.
  2. Use `npm run search:process-outbox` to replay missed events if they exist in the outbox.

## 3. Rollback Procedures

### Application Rollback

- Use `flyctl deploy --image <previous-image-tag>` or `flyctl rollback`.

### Database Rollback

- Revert local migrations and redeploy.
- **Warning**: Extreme caution required when rolling back schema changes in production.

### Search Configuration Rollback

- Re-apply index settings from the previous version of `scripts/algolia/configure-algolia-index.ts`.
