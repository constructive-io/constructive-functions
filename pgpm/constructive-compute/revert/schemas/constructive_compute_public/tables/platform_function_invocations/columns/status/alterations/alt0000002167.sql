-- Revert: schemas/constructive_compute_public/tables/platform_function_invocations/columns/status/alterations/alt0000002167


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  ALTER COLUMN status DROP NOT NULL;


