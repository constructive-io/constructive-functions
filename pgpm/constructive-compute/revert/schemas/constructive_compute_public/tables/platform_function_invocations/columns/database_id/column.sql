-- Revert: schemas/constructive_compute_public/tables/platform_function_invocations/columns/database_id/column


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  DROP COLUMN database_id RESTRICT;


