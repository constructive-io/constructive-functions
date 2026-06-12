-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/database_id/alterations/alt0000002589
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/database_id/column


COMMENT ON COLUMN "constructive_platform_function_graph_public".platform_function_graph_store.database_id IS E'Database scope for multi-tenant isolation';

