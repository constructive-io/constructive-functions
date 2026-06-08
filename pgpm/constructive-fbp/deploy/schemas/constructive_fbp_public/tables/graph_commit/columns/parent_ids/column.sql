-- Deploy: schemas/constructive_fbp_public/tables/graph_commit/columns/parent_ids/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_commit/table


ALTER TABLE "constructive_fbp_public".graph_commit 
  ADD COLUMN parent_ids uuid[];

