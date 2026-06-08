-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/entity_id/alterations/alt0000000022
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/entity_id/column


COMMENT ON COLUMN "constructive_fbp_private".function_graph_executions.entity_id IS E'Entity context (org/team) for scoped billing';

