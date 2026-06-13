-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/created_at/column
-- created_at is the partition key — cannot be dropped independently; removed with DROP TABLE CASCADE

SELECT 1;
