-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/indexes/idx_platform_function_graph_store_unique_name
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/table
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/database_id/column


CREATE UNIQUE INDEX idx_platform_function_graph_store_unique_name ON "constructive_platform_function_graph_public".platform_function_graph_store ( database_id, (decode(md5(lower(name)), 'hex')) );

