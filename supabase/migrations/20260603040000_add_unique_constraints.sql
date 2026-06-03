-- Add unique constraints for seeding stability
ALTER TABLE public.categories 
ADD CONSTRAINT categories_name_unique UNIQUE (name);

ALTER TABLE public.part_types 
ADD CONSTRAINT part_types_category_id_name_unique UNIQUE (category_id, name);

ALTER TABLE public.models
ADD CONSTRAINT models_make_id_name_unique UNIQUE (make_id, name);

ALTER TABLE public.vehicle_variants
ADD CONSTRAINT vehicle_variants_model_id_year_unique UNIQUE (model_id, year);
