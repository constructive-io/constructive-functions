-- Revert: schemas/constructive_fbp_public/tables/graph_store/columns/name/column


ALTER TABLE "constructive_fbp_public".graph_store 
  DROP COLUMN name RESTRICT;


