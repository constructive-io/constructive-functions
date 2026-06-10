-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/duration_ms/column


ALTER TABLE "constructive_compute_public".app_function_invocations 
  DROP COLUMN duration_ms RESTRICT;


