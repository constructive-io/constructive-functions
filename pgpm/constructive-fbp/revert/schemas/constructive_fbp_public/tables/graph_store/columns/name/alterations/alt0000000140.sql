-- Revert: schemas/constructive_fbp_public/tables/graph_store/columns/name/alterations/alt0000000140


ALTER TABLE "constructive_fbp_public".graph_store 
  ALTER COLUMN name DROP NOT NULL;


