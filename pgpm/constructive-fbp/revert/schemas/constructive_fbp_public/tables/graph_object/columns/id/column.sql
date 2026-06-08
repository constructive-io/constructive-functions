-- Revert: schemas/constructive_fbp_public/tables/graph_object/columns/id/column


ALTER TABLE "constructive_fbp_public".graph_object 
  DROP COLUMN id RESTRICT;


