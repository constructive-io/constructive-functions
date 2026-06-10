-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/owner_id/column


ALTER TABLE "constructive_compute_public".app_function_invocations 
  DROP COLUMN owner_id RESTRICT;


