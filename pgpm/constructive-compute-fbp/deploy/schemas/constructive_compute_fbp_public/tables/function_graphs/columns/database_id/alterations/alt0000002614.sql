-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/database_id/alterations/alt0000002614
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/database_id/column


COMMENT ON COLUMN "constructive_compute_fbp_public".function_graphs.database_id IS E'Database scope for multi-tenant isolation';

