-- 1. Create ENUM types
DO $$ BEGIN
    CREATE TYPE public.part_status AS ENUM (
        'DRAFT', 'PENDING_REVIEW', 'AVAILABLE', 'RESERVED', 'SOLD', 'REMOVED', 'ARCHIVED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.part_condition AS ENUM (
        'NEW', 'REMANUFACTURED', 'USED_EXCELLENT', 'USED_GOOD', 'USED_FAIR', 'FOR_PARTS'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Clean up dependencies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'parts'
    LOOP
        EXECUTE format('DROP POLICY %I ON public.parts', pol.policyname);
    END LOOP;
END $$;

-- Drop constraints if they exist
ALTER TABLE public.parts DROP CONSTRAINT IF EXISTS parts_status_check;
ALTER TABLE public.parts DROP CONSTRAINT IF EXISTS parts_condition_check;
ALTER TABLE public.parts ALTER COLUMN status DROP DEFAULT;

-- 3. Update existing data and alter columns
ALTER TABLE public.parts 
  ALTER COLUMN status TYPE public.part_status USING UPPER(status)::public.part_status,
  ALTER COLUMN condition TYPE public.part_condition USING UPPER(condition)::public.part_condition;

-- 4. Re-apply constraints and default
ALTER TABLE public.parts ADD CONSTRAINT parts_status_check CHECK (status = ANY (ARRAY['DRAFT'::part_status, 'PENDING_REVIEW'::part_status, 'AVAILABLE'::part_status, 'RESERVED'::part_status, 'SOLD'::part_status, 'REMOVED'::part_status, 'ARCHIVED'::part_status]));
ALTER TABLE public.parts ADD CONSTRAINT parts_condition_check CHECK (condition = ANY (ARRAY['NEW'::part_condition, 'REMANUFACTURED'::part_condition, 'USED_EXCELLENT'::part_condition, 'USED_GOOD'::part_condition, 'USED_FAIR'::part_condition, 'FOR_PARTS'::part_condition]));
ALTER TABLE public.parts ALTER COLUMN status SET DEFAULT 'DRAFT';

-- 5. Re-enable RLS
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
