-- Deploy: schemas/constructive_fbp_public/tables/graph_object/columns/database_id/alterations/alt0000000112
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_object/columns/database_id/column


COMMENT ON COLUMN "constructive_fbp_public".graph_object.database_id IS E'Database scope for multi-tenant isolation';

