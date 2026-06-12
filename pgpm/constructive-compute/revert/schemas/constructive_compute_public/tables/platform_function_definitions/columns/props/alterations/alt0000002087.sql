-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/props/alterations/alt0000002087


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN props DROP NOT NULL;


