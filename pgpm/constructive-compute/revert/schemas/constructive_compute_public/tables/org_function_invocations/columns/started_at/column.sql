-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/started_at/column


ALTER TABLE "constructive_compute_public".org_function_invocations 
  DROP COLUMN started_at RESTRICT;


