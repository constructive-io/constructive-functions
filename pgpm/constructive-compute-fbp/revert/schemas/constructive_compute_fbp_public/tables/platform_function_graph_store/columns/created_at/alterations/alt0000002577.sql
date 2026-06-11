-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/created_at/alterations/alt0000002577


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_store 
  ALTER COLUMN created_at DROP DEFAULT;


