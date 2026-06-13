-- Revert: schemas/constructive_infra_public/tables/platform_function_invocations/columns/database_id/alterations/alt0000000060


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  ALTER COLUMN database_id DROP NOT NULL;


