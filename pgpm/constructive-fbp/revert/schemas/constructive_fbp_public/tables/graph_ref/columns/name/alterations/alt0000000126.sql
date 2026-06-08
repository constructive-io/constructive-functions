-- Revert: schemas/constructive_fbp_public/tables/graph_ref/columns/name/alterations/alt0000000126


ALTER TABLE "constructive_fbp_public".graph_ref 
  ALTER COLUMN name DROP NOT NULL;


