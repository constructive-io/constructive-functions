-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/indexes/idx_function_graphs_unique_name
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/database_id/column
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/name/column


CREATE UNIQUE INDEX idx_function_graphs_unique_name ON "constructive_compute_fbp_public".function_graphs ( database_id, name );

