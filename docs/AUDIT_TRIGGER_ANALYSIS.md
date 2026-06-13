# AUDIT_TRIGGER_ANALYSIS.md

## Root Cause
The audit logging mechanism is failing because the partitioned table `public.audit_log_2026_06` enforces a `NOT NULL` constraint on the `id` column, but neither the trigger `public.fn_audit_log_changes` nor the table definition for `public.audit_log_partitioned` appears to correctly generate a default value (e.g., `DEFAULT gen_random_uuid()`) for this column.

## Findings
1.  **Trigger Logic**: The trigger function `public.fn_audit_log_changes` does not attempt to populate the `id` field.
2.  **Table Constraints**: The table `public.audit_log_partitioned` defines `id uuid NOT NULL`.
3.  **Missing Default**: There is no evidence of a `DEFAULT gen_random_uuid()` constraint on the `id` column of the partitioned table or its partitions.

## Recommended Remediation
1.  **Modify Table Definition**: Alter the partitioned table to include `DEFAULT gen_random_uuid()` for the `id` column.
    ```sql
    ALTER TABLE public.audit_log_partitioned ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ```
2.  **Re-verify Partitions**: Ensure existing partitions (`audit_log_2026_06`) inherit this default or apply the default to them explicitly.
3.  **Audit Migration**: Run the destructive migration swap mentioned in `20260607090001_audit_log_partitioning_swap.sql` to ensure the partitioned table is the active audit log.
