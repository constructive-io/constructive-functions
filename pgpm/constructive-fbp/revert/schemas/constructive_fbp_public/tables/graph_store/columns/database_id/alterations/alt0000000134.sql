-- Revert: schemas/constructive_fbp_public/tables/graph_store/columns/database_id/alterations/alt0000000134


ALTER TABLE "constructive_fbp_public".graph_store 
  ALTER COLUMN database_id DROP NOT NULL;


