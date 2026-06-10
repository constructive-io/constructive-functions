-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/database_id/alterations/alt0000002574


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_store 
  ALTER COLUMN database_id DROP NOT NULL;


