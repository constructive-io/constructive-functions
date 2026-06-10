-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/id/column


ALTER TABLE "constructive_compute_public".app_function_invocations 
  DROP COLUMN id RESTRICT;


