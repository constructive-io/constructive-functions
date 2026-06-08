-- Deploy: schemas/constructive_fbp_public/tables/graph_commit/columns/id/alterations/alt0000000099
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_commit/table
-- requires: schemas/constructive_fbp_public/tables/graph_commit/columns/id/column


ALTER TABLE "constructive_fbp_public".graph_commit 
  ALTER COLUMN id SET DEFAULT uuidv7();

