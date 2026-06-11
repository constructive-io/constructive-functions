-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/tree_id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_commit 
  DROP COLUMN tree_id RESTRICT;


