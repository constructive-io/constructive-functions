-- Revert: schemas/constructive_fbp_public/tables/graph_object/columns/created_at/column


ALTER TABLE "constructive_fbp_public".graph_object 
  DROP COLUMN created_at RESTRICT;


