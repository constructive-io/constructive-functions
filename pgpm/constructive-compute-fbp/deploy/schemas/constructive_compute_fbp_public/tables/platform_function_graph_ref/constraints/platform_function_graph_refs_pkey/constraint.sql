-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/constraints/platform_function_graph_refs_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/table
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/id/column
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/database_id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_ref 
  ADD CONSTRAINT platform_function_graph_refs_pkey PRIMARY KEY (id, database_id);

