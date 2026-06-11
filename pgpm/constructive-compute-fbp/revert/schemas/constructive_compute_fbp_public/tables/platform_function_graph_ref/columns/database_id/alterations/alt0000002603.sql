-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/database_id/alterations/alt0000002603


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_ref 
  ALTER COLUMN database_id DROP NOT NULL;


