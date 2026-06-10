-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/status/column


ALTER TABLE "constructive_compute_public".app_function_invocations 
  DROP COLUMN status RESTRICT;


