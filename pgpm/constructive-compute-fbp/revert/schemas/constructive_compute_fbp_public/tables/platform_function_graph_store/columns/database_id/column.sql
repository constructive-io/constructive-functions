-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/database_id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_store 
  DROP COLUMN database_id RESTRICT;


