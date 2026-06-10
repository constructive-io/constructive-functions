-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/status/alterations/alt0000002165


ALTER TABLE "constructive_compute_public".org_function_invocations 
  DROP CONSTRAINT org_function_invocations_status_chk;


