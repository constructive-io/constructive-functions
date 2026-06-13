-- Revert: schemas/constructive_infra_public/tables/platform_function_invocations/columns/function_id/column


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  DROP COLUMN function_id RESTRICT;


