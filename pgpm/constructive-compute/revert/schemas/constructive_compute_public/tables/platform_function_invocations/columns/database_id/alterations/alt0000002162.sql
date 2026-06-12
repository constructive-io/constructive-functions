-- Revert: schemas/constructive_compute_public/tables/platform_function_invocations/columns/database_id/alterations/alt0000002162


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  ALTER COLUMN database_id DROP NOT NULL;


