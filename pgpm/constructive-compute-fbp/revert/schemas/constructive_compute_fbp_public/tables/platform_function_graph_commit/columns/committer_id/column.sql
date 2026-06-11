-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/committer_id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_commit 
  DROP COLUMN committer_id RESTRICT;


