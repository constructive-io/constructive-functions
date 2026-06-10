-- Revert: schemas/constructive_compute_public/tables/platform_function_invocations/columns/status/column


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  DROP COLUMN status RESTRICT;


