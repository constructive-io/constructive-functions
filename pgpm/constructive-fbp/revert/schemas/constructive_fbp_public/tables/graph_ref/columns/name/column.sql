-- Revert: schemas/constructive_fbp_public/tables/graph_ref/columns/name/column


ALTER TABLE "constructive_fbp_public".graph_ref 
  DROP COLUMN name RESTRICT;


