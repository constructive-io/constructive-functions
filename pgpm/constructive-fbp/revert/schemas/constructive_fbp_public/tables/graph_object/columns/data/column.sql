-- Revert: schemas/constructive_fbp_public/tables/graph_object/columns/data/column


ALTER TABLE "constructive_fbp_public".graph_object 
  DROP COLUMN data RESTRICT;


