-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/priority/alterations/alt0000002066


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN priority DROP DEFAULT;


