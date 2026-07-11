<div align="center">
  <h1>PartsPeddle Frontend</h1>
  <p>Next.js marketplace for used auto parts.</p>
</div>

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 9
- [flyctl](https://fly.io/docs/flyctl/install/) (for deployments)

## Local Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local` with your Supabase, Algolia, and Gemini credentials.

4. Run the dev server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                     | Description                                  |
| --------------------------- | -------------------------------------------- |
| `pnpm dev`                  | Start Next.js dev server                     |
| `pnpm build`                | Build for production                         |
| `pnpm start`                | Start production server                      |
| `pnpm lint`                 | Run ESLint on `src` and `scripts`            |
| `pnpm typecheck`            | Run TypeScript without emit                  |
| `pnpm test`                 | Run branch/certification tests               |
| `pnpm test:e2e:smoke:local` | Run Playwright smoke tests against localhost |
| `pnpm search:reindex`       | Rebuild the Algolia search index             |
| `pnpm algolia:config`       | Configure Algolia index settings             |
| `pnpm deploy:staging`       | Deploy to Fly.io staging                     |
| `pnpm deploy:production`    | Deploy to Fly.io production                  |

## Documentation

- `docs/DEPLOYMENT_RUNBOOK.md` — full deployment procedure.
- `docs/operations/delivery-audit.md` — current delivery pipeline audit.
- `docs/operations/deployment-observability.md` — deployment artifact format and records.
- `docs/operations/secret-governance.md` — secret storage policy.
- `docs/engineering/security.md` — CSP and application security.
- `.planning/platform-repository-evolution.md` — platform evolution plan.

## Deployment

Deployments run against Fly.io. Always deploy **staging** from `develop` and **production** from `main`:

```bash
# Staging
git checkout develop
pnpm deploy:staging

# Production
git checkout main
pnpm deploy:production
```

See `docs/DEPLOYMENT_RUNBOOK.md` for the full procedure.
