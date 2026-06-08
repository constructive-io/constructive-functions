-- Revert: schemas/constructive_fbp_public/tables/graph_commit/columns/database_id/column


ALTER TABLE "constructive_fbp_public".graph_commit 
  DROP COLUMN database_id RESTRICT;


