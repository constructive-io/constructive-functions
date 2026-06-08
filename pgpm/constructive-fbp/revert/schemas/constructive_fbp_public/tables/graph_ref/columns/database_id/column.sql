-- Revert: schemas/constructive_fbp_public/tables/graph_ref/columns/database_id/column


ALTER TABLE "constructive_fbp_public".graph_ref 
  DROP COLUMN database_id RESTRICT;


