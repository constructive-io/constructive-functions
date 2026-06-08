-- Deploy: schemas/constructive_fbp_public/tables/graph_store/indexes/idx_graph_store_unique_name
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_store/table
-- requires: schemas/constructive_fbp_public/tables/graph_store/columns/database_id/column


CREATE UNIQUE INDEX idx_graph_store_unique_name ON "constructive_fbp_public".graph_store ( database_id, (decode(md5(lower(name)), 'hex')) );

