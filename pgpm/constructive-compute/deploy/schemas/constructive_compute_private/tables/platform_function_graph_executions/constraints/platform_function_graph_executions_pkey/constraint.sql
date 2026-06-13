-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/constraints/platform_function_graph_executions_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ADD CONSTRAINT platform_function_graph_executions_pkey PRIMARY KEY (started_at, id);

