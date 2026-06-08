-- Revert: schemas/constructive_fbp_public/tables/graph_commit/columns/date/alterations/alt0000000095


ALTER TABLE "constructive_fbp_public".graph_commit 
  ALTER COLUMN date DROP NOT NULL;


