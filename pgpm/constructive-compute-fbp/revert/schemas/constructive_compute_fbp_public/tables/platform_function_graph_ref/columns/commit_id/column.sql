-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/commit_id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_ref 
  DROP COLUMN commit_id RESTRICT;


