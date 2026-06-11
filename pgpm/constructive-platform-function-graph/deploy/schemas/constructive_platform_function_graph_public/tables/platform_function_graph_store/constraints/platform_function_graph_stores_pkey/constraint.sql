-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/constraints/platform_function_graph_stores_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/table
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/id/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_store 
  ADD CONSTRAINT platform_function_graph_stores_pkey PRIMARY KEY (id);

