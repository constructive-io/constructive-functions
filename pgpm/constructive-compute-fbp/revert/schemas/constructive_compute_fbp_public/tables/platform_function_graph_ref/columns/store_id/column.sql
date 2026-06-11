-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/store_id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_ref 
  DROP COLUMN store_id RESTRICT;


