-- Revert: schemas/constructive_fbp_public/tables/graph_object/columns/database_id/alterations/alt0000000111


ALTER TABLE "constructive_fbp_public".graph_object 
  ALTER COLUMN database_id DROP NOT NULL;


