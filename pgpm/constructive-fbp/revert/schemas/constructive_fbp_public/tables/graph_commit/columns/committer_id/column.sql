-- Revert: schemas/constructive_fbp_public/tables/graph_commit/columns/committer_id/column


ALTER TABLE "constructive_fbp_public".graph_commit 
  DROP COLUMN committer_id RESTRICT;


