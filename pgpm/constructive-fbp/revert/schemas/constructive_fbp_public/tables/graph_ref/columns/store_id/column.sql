-- Revert: schemas/constructive_fbp_public/tables/graph_ref/columns/store_id/column


ALTER TABLE "constructive_fbp_public".graph_ref 
  DROP COLUMN store_id RESTRICT;


