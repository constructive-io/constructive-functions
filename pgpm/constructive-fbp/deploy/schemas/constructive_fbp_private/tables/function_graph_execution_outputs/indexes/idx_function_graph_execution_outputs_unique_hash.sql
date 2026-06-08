-- Deploy: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/indexes/idx_function_graph_execution_outputs_unique_hash
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/table
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/database_id/column
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/hash/column
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/created_at/column


CREATE UNIQUE INDEX idx_function_graph_execution_outputs_unique_hash ON "constructive_fbp_private".function_graph_execution_outputs ( database_id, hash, created_at );

