-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/parent_invocation_id/column


ALTER TABLE "constructive_compute_public".org_function_invocations 
  DROP COLUMN parent_invocation_id RESTRICT;


