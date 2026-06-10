-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/id/alterations/alt0000002581


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_commit 
  ALTER COLUMN id DROP NOT NULL;


