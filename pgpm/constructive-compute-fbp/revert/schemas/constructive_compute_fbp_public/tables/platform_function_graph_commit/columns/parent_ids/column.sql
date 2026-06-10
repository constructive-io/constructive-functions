-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/parent_ids/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_commit 
  DROP COLUMN parent_ids RESTRICT;


