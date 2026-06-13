# AUDIT_PARTITION_VALIDATION.md

| Object                | Default Present | Result |
| --------------------- | --------------- | ------ |
| audit_log_partitioned | Unknown (Blocked) | FAIL   |
| audit_log_2026_06     | Unknown (Blocked) | FAIL   |
| audit_log_2026_07     | Unknown (Blocked) | FAIL   |

## Summary
While direct metadata inspection (querying `information_schema`) was blocked by Supabase schema cache constraints, the functional failure of DML operations (`INSERT`/`UPDATE`) due to `null value in column "id"` confirms that the `id` column in these partitions is `NOT NULL` and lacks a functional `DEFAULT` value generator (e.g., `gen_random_uuid()`).

## Next Steps
- Implement SQL migration to alter table structure for default ID generation.
- Re-run validation after migration.
