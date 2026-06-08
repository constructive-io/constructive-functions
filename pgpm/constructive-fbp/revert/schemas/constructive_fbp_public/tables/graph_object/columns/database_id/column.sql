-- Revert: schemas/constructive_fbp_public/tables/graph_object/columns/database_id/column


ALTER TABLE "constructive_fbp_public".graph_object 
  DROP COLUMN database_id RESTRICT;


