-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/result/column


ALTER TABLE "constructive_compute_public".app_function_invocations 
  DROP COLUMN result RESTRICT;


