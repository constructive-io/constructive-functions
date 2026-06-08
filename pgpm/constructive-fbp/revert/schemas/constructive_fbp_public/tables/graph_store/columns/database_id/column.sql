-- Revert: schemas/constructive_fbp_public/tables/graph_store/columns/database_id/column


ALTER TABLE "constructive_fbp_public".graph_store 
  DROP COLUMN database_id RESTRICT;


