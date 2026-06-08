-- Revert: schemas/constructive_infra_public/tables/platform_function_invocations/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  DROP COLUMN database_id RESTRICT;


