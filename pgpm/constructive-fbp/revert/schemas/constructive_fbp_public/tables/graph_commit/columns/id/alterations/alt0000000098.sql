-- Revert: schemas/constructive_fbp_public/tables/graph_commit/columns/id/alterations/alt0000000098


ALTER TABLE "constructive_fbp_public".graph_commit 
  ALTER COLUMN id DROP NOT NULL;


