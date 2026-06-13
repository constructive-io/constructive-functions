-- Revert: schemas/constructive_compute_public/tables/platform_function_invocations/columns/completed_at/column


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  DROP COLUMN completed_at RESTRICT;


