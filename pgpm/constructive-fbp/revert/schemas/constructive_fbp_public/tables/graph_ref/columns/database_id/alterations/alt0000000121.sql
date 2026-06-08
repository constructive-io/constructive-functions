-- Revert: schemas/constructive_fbp_public/tables/graph_ref/columns/database_id/alterations/alt0000000121


ALTER TABLE "constructive_fbp_public".graph_ref 
  ALTER COLUMN database_id DROP NOT NULL;


