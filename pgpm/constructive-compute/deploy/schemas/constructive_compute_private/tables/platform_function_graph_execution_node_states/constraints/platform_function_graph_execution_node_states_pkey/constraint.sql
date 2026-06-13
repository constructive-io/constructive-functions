-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/constraints/platform_function_graph_execution_node_states_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/table


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states 
  ADD CONSTRAINT platform_function_graph_execution_node_states_pkey PRIMARY KEY (created_at, id);

