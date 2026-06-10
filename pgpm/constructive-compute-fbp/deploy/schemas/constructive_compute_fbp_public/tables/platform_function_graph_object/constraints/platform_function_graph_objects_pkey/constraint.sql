-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/constraints/platform_function_graph_objects_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/table
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/id/column
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/database_id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_object 
  ADD CONSTRAINT platform_function_graph_objects_pkey PRIMARY KEY (id, database_id);

