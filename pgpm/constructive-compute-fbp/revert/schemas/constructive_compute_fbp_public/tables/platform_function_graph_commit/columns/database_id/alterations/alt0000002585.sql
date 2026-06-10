-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/database_id/alterations/alt0000002585


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_commit 
  ALTER COLUMN database_id DROP NOT NULL;


