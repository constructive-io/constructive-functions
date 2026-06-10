-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/owner_id/alterations/alt0000002109


ALTER TABLE "constructive_compute_public".app_function_invocations 
  ALTER COLUMN owner_id DROP NOT NULL;


