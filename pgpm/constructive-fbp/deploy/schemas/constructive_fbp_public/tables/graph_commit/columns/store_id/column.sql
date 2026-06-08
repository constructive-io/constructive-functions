-- Deploy: schemas/constructive_fbp_public/tables/graph_commit/columns/store_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_commit/table


ALTER TABLE "constructive_fbp_public".graph_commit 
  ADD COLUMN store_id uuid;

