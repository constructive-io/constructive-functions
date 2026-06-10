-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/database_id/alterations/alt0000002575
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/database_id/column


COMMENT ON COLUMN "constructive_compute_fbp_public".platform_function_graph_store.database_id IS E'Database scope for multi-tenant isolation';

