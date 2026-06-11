-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/created_at/alterations/alt0000002564


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_object 
  ALTER COLUMN created_at DROP DEFAULT;


