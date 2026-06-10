-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/completed_at/column


ALTER TABLE "constructive_compute_public".app_function_invocations 
  DROP COLUMN completed_at RESTRICT;


