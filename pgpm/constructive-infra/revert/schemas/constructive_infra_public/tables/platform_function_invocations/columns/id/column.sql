-- Revert: schemas/constructive_infra_public/tables/platform_function_invocations/columns/id/column


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  DROP COLUMN id RESTRICT;


