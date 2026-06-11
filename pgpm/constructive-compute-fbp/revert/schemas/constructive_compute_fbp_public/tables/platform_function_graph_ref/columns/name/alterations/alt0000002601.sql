-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/name/alterations/alt0000002601


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_ref 
  ALTER COLUMN name DROP NOT NULL;


