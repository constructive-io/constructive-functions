-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/id/alterations/alt0000002104


ALTER TABLE "constructive_compute_public".app_function_invocations 
  ALTER COLUMN id DROP NOT NULL;


