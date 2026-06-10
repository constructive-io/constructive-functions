-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/graph_id/alterations/alt0000002696
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/graph_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.graph_id IS 'FK to the graph definition being executed';

