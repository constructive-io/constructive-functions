-- Revert: schemas/constructive_fbp_public/tables/graph_ref/columns/commit_id/column


ALTER TABLE "constructive_fbp_public".graph_ref 
  DROP COLUMN commit_id RESTRICT;


