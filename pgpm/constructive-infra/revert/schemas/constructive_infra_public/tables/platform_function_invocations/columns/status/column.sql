-- Revert: schemas/constructive_infra_public/tables/platform_function_invocations/columns/status/column


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  DROP COLUMN status RESTRICT;


