-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/indexes/idx_platform_function_graphs_unique_name
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/database_id/column
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/name/column


CREATE UNIQUE INDEX idx_platform_function_graphs_unique_name ON "constructive_compute_public".platform_function_graphs ( database_id, name );

