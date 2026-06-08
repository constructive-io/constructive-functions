-- Revert: schemas/constructive_infra_public/tables/platform_function_invocations/columns/status/alterations/alt0000000073


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  ALTER COLUMN status DROP DEFAULT;


