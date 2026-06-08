-- Deploy: schemas/constructive_fbp_public/tables/graph_commit/columns/date/alterations/alt0000000095
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_commit/table
-- requires: schemas/constructive_fbp_public/tables/graph_commit/columns/date/column


ALTER TABLE "constructive_fbp_public".graph_commit 
  ALTER COLUMN date SET NOT NULL;

