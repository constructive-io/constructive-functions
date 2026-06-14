-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/indexes/idx_platform_function_graph_execution_outputs_unique_hash
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/table


CREATE UNIQUE INDEX idx_platform_function_graph_execution_outputs_unique_hash ON "constructive_compute_public".platform_function_graph_execution_outputs ( database_id, hash, created_at );

