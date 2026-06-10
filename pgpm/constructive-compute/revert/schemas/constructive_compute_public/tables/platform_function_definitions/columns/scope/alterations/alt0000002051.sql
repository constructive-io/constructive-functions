-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/scope/alterations/alt0000002051


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN scope DROP NOT NULL;


