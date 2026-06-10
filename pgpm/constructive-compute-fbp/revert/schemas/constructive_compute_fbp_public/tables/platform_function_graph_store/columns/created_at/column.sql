-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/created_at/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_store 
  DROP COLUMN created_at RESTRICT;


