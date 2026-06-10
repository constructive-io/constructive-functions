-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/is_built_in/alterations/alt0000002072


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN is_built_in DROP NOT NULL;


