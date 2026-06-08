-- Revert: schemas/constructive_fbp_public/tables/graph_store/columns/id/alterations/alt0000000137


ALTER TABLE "constructive_fbp_public".graph_store 
  ALTER COLUMN id DROP NOT NULL;


