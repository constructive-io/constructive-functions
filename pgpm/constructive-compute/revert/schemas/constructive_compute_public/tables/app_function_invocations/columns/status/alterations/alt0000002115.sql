-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/status/alterations/alt0000002115


ALTER TABLE "constructive_compute_public".app_function_invocations 
  ALTER COLUMN status DROP DEFAULT;


