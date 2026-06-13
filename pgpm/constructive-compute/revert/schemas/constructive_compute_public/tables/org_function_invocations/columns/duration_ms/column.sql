-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/duration_ms/column


ALTER TABLE "constructive_compute_public".org_function_invocations 
  DROP COLUMN duration_ms RESTRICT;


