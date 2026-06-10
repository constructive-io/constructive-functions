-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/id/alterations/alt0000002557


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_object 
  ALTER COLUMN id DROP NOT NULL;


