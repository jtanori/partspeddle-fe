# Route Inventory Audit

| Route               | Component                                    | Purpose          | Status |
| :------------------ | :------------------------------------------- | :--------------- | :----- |
| `/`                 | `src/app/(public)/page.tsx`                  | Home Page        | ACTIVE |
| `/login`            | `src/app/(auth)/login/page.tsx`              | Login Page       | ACTIVE |
| `/register`         | `src/app/(auth)/register/page.tsx`           | Register Page    | ACTIVE |
| `/dashboard`        | `src/app/(dashboard)/dashboard/page.tsx`     | User Dashboard   | ACTIVE |
| `/listing/[id]`     | `src/app/(public)/listing/[id]/page.tsx`     | Product Detail   | ACTIVE |
| `/search`           | `src/app/(public)/search/page.tsx`           | Search Results   | ACTIVE |
| `/seller`           | `src/app/(seller)/seller/page.tsx`           | Seller Dashboard | ACTIVE |
| `/seller/create`    | `src/app/(seller)/seller/create/page.tsx`    | Create Listing   | ACTIVE |
| `/seller/inventory` | `src/app/(seller)/seller/inventory/page.tsx` | Seller Inventory | ACTIVE |
| `/seller/orders`    | `src/app/(seller)/seller/orders/page.tsx`    | Seller Orders    | ACTIVE |
| `/seller/settings`  | `src/app/(seller)/seller/settings/page.tsx`  | Seller Settings  | ACTIVE |

## API Routes

| Endpoint                             | Purpose                  | Status |
| :----------------------------------- | :----------------------- | :----- |
| `/api/admin/search/reindex`          | Full search reindexing   | ACTIVE |
| `/api/admin/search/reindex/[partId]` | Single part reindexing   | ACTIVE |
| `/api/gemini/identify`               | AI part identification   | ACTIVE |
| `/api/health`                        | System health check      | ACTIVE |
| `/api/parts/featured`                | Fetch featured parts     | ACTIVE |
| `/api/search/clicks`                 | Track search clicks      | ACTIVE |
| `/api/search/events`                 | Track search events      | ACTIVE |
| `/api/search/parts`                  | Main search API          | ACTIVE |
| `/api/search/suggestions`            | Fetch search suggestions | ACTIVE |
| `/api/seller/profile`                | Manage seller profile    | ACTIVE |
| `/api/seller/upload-logo`            | Upload seller logo       | ACTIVE |
| `/api/sellers/top`                   | Fetch top sellers        | ACTIVE |

## Audit Verdict

**STATUS: PASS**
All identified routes are linked or intentionally preserved for system operations.
