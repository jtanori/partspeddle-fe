-- P6.3 — Remove unused Postgres extensions to reduce attack surface.
-- Marketplace core only requires `pgcrypto` (gen_random_uuid) and `pg_stat_statements`.

DROP EXTENSION IF EXISTS "pg_net";
DROP EXTENSION IF EXISTS "pg_graphql";
DROP EXTENSION IF EXISTS "supabase_vault";
DROP EXTENSION IF EXISTS "uuid-ossp";
