-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/graph_execution_id/column


ALTER TABLE "constructive_compute_public".org_function_invocations 
  DROP COLUMN graph_execution_id RESTRICT;


