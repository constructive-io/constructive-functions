-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/definitions_commit_id/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  DROP COLUMN definitions_commit_id RESTRICT;


