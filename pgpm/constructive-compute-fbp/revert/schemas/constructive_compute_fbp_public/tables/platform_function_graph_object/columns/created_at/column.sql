-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/created_at/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_object 
  DROP COLUMN created_at RESTRICT;


