-- Revert: schemas/constructive_fbp_public/tables/graph_commit/columns/store_id/alterations/alt0000000103


ALTER TABLE "constructive_fbp_public".graph_commit 
  ALTER COLUMN store_id DROP NOT NULL;


