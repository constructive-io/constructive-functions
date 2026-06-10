-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/parent_invocation_id/column


ALTER TABLE "constructive_compute_public".app_function_invocations 
  DROP COLUMN parent_invocation_id RESTRICT;


