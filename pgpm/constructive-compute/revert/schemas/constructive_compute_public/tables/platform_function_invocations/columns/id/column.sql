-- Revert: schemas/constructive_compute_public/tables/platform_function_invocations/columns/id/column


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  DROP COLUMN id RESTRICT;


