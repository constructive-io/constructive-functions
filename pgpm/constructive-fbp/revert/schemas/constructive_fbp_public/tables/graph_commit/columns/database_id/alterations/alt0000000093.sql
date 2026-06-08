-- Revert: schemas/constructive_fbp_public/tables/graph_commit/columns/database_id/alterations/alt0000000093


ALTER TABLE "constructive_fbp_public".graph_commit 
  ALTER COLUMN database_id DROP NOT NULL;


