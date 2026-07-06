-- Migration to apply ON DELETE CASCADE to dependent part tables
-- Generated: 2026-06-11

BEGIN;

-- 1. Drop existing constraints
ALTER TABLE public.part_images DROP CONSTRAINT part_images_part_id_fkey;
ALTER TABLE public.part_fitment DROP CONSTRAINT part_fitment_part_id_fkey;

-- 2. Re-add constraints with ON DELETE CASCADE
ALTER TABLE public.part_images 
ADD CONSTRAINT part_images_part_id_fkey 
FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE CASCADE;

ALTER TABLE public.part_fitment 
ADD CONSTRAINT part_fitment_part_id_fkey 
FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE CASCADE;

COMMIT;
