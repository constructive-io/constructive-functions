-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/ktree/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_object 
  DROP COLUMN ktree RESTRICT;


