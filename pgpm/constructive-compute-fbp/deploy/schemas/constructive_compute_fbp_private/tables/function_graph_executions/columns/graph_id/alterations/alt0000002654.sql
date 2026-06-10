-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/graph_id/alterations/alt0000002654
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/graph_id/column


COMMENT ON COLUMN "constructive_compute_fbp_private".function_graph_executions.graph_id IS 'FK to the graph definition being executed';

