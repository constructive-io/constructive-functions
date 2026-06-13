-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/required_configs/alterations/alt0000002078


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN required_configs DROP NOT NULL;


