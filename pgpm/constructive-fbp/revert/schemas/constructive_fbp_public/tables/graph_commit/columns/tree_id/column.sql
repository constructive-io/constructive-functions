-- Revert: schemas/constructive_fbp_public/tables/graph_commit/columns/tree_id/column


ALTER TABLE "constructive_fbp_public".graph_commit 
  DROP COLUMN tree_id RESTRICT;


