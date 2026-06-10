-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/entity_id/alterations/alt0000002658
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/entity_id/column


COMMENT ON COLUMN "constructive_compute_fbp_private".function_graph_executions.entity_id IS E'Entity context (org/team) for scoped billing';

