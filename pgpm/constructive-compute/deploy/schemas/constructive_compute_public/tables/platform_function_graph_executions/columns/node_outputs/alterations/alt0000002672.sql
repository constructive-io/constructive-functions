-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/node_outputs/alterations/alt0000002672
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/node_outputs/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_executions.node_outputs IS E'Map of node_name → execution output id (content-addressed hash reference)';

