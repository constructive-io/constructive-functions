-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/entity_id/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  DROP COLUMN entity_id RESTRICT;


