-- Revert: schemas/constructive_compute_public/tables/platform_function_invocations/columns/status/alterations/alt0000002164


ALTER TABLE "constructive_compute_public".platform_function_invocations 
  DROP CONSTRAINT platform_function_invocations_status_chk;


