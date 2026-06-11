-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/status/column


ALTER TABLE "constructive_compute_public".org_function_invocations 
  DROP COLUMN status RESTRICT;


