# Environment Drift Matrix

Runtime variables that must exist in every deployment environment (staging, production).
This matrix is used for **DC-7.1 Environment Drift Certification**.

| Variable                        | Staging | Production | Provider    | Secret |
| ------------------------------- | ------- | ---------- | ----------- | ------ |
| `APP_URL`                       | ✅      | ✅         | fly-secrets | No     |
| `SUPABASE_URL`                  | ✅      | ✅         | fly-secrets | No     |
| `SUPABASE_ANON_KEY`             | ✅      | ✅         | fly-secrets | Yes    |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅      | ✅         | fly-secrets | Yes    |
| `ALGOLIA_APP_ID`                | ✅      | ✅         | fly-secrets | No     |
| `ALGOLIA_ADMIN_KEY`             | ✅      | ✅         | fly-secrets | Yes    |
| `ALGOLIA_SEARCH_INDEX_NAME`     | ✅      | ✅         | fly-secrets | No     |
| `ALGOLIA_INDEX_PRICE_ASC`       | ✅      | ✅         | fly-secrets | No     |
| `ALGOLIA_INDEX_PRICE_DESC`      | ✅      | ✅         | fly-secrets | No     |
| `ALGOLIA_INDEX_NEWEST`          | ✅      | ✅         | fly-secrets | No     |
| `GEMINI_API_KEY`                | ✅      | ✅         | fly-secrets | Yes    |
| `SUPABASE_WEBHOOK_SECRET`       | ✅      | ✅         | fly-secrets | Yes    |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅      | ✅         | fly-secrets | No     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅      | ✅         | fly-secrets | Yes    |

> Values are not compared; only schema presence is verified.
