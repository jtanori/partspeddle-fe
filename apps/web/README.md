# apps/web

The Next.js 16 + App Router web application for PartsPeddle / VinTrack.

## Contents

- `src/app/` — App Router pages and API routes.
- `src/components/` — React components.
- `src/hooks/` — React hooks.
- `src/store/` — Client state management.
- `src/lib/` — Application-specific utilities.
- `src/projection/` — UI read models.
- `src/backend/` — Backend modules (e.g., search).
- `public/` — Static assets.
- `next.config.ts` — Next.js configuration.

## Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Lint application source
pnpm typecheck  # Type-check application source
```

The root `package.json` delegates these commands via `pnpm --filter @partspeddle/web`.
