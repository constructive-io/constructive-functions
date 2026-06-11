-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/date/alterations/alt0000002594


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_commit 
  ALTER COLUMN date DROP DEFAULT;


