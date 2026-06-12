-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/entity_id/alterations/alt0000002672
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/entity_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.entity_id IS E'Entity context (org/team) for scoped billing';

