-- Revert: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/kids/alterations/alt0000002566


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_object 
  DROP CONSTRAINT platform_function_graph_objects_kids_ktree_chk;


