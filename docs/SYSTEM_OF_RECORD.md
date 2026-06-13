# SYSTEM OF RECORD (SoR)

## Core Subsystems

### Search Platform

- **Status**: Platinum Certified
- **Authoritative Route**: `app/(public)/search/page.tsx`
- **Authoritative API**: `POST /api/search/parts`
- **Authoritative Repository**: `src/backend/modules/search/infrastructure/algolia-search-repository.ts`
- **Authoritative Service**: `src/backend/modules/search/application/build-search-document.ts`
- **Protected Contracts**:
  - `src/backend/modules/search/contracts/search-api.ts`
  - `src/backend/modules/search/contracts/search-index-spec.ts`

### Authentication

- **Status**: Certified
- **Authoritative Route**: `app/(auth)/login/page.tsx`
- **Authoritative Service**: `src/lib/supabase/auth.ts`
- **Authoritative Component**: `src/components/AuthPage.tsx`

### Marketplace / Catalog

- **Status**: Active
- **Authoritative Route**: `app/(public)/marketplace/page.tsx`
- **Authoritative Repository**: `src/backend/modules/catalog/infrastructure/supabase-catalog-repository.ts`

## Fail Condition

If multiple files claim authority for the same subsystem (e.g., `SearchService.ts` vs `SearchServiceV2.ts`), the **Architectural Integrity Certification (AIC)** fails immediately.
