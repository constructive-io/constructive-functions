-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/name/alterations/alt0000002053


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN name DROP NOT NULL;


