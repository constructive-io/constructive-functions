-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/updated_at/alterations/alt0000002050


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN updated_at DROP DEFAULT;


