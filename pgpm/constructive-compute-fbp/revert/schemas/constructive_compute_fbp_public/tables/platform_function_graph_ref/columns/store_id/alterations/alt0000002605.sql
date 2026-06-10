-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/store_id/alterations/alt0000002605


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_ref 
  ALTER COLUMN store_id DROP NOT NULL;


