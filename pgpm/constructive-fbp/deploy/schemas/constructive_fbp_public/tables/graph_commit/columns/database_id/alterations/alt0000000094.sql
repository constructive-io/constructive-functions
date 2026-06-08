-- Deploy: schemas/constructive_fbp_public/tables/graph_commit/columns/database_id/alterations/alt0000000094
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_commit/columns/database_id/column


COMMENT ON COLUMN "constructive_fbp_public".graph_commit.database_id IS E'Database scope for multi-tenant isolation';

