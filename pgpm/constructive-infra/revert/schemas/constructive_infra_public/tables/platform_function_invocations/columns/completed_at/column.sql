-- Revert: schemas/constructive_infra_public/tables/platform_function_invocations/columns/completed_at/column


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  DROP COLUMN completed_at RESTRICT;


