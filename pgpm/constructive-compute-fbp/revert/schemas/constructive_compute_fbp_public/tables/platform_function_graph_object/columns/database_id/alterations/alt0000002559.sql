-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/database_id/alterations/alt0000002559


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_object 
  ALTER COLUMN database_id DROP NOT NULL;


