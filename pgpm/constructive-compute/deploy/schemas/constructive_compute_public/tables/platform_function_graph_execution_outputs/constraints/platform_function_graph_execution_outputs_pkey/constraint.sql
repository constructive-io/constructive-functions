-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/constraints/platform_function_graph_execution_outputs_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/table


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_outputs 
  ADD CONSTRAINT platform_function_graph_execution_outputs_pkey PRIMARY KEY (created_at, id);

