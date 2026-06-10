-- Revert: schemas/constructive_compute_public/tables/app_function_invocations/columns/status/alterations/alt0000002125


ALTER TABLE "constructive_compute_public".app_function_invocations 
  DROP CONSTRAINT app_function_invocations_status_chk;


