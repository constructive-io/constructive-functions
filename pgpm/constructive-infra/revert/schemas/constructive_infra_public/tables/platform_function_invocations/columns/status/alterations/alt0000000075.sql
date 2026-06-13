-- Revert: schemas/constructive_infra_public/tables/platform_function_invocations/columns/status/alterations/alt0000000075


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  DROP CONSTRAINT platform_function_invocations_status_chk;


