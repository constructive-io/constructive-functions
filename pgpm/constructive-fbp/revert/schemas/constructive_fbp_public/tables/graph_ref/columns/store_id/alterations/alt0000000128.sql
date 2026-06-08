-- Revert: schemas/constructive_fbp_public/tables/graph_ref/columns/store_id/alterations/alt0000000128


ALTER TABLE "constructive_fbp_public".graph_ref 
  ALTER COLUMN store_id DROP NOT NULL;


