-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/constraints/function_graph_executions_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/started_at/column
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/id/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ADD CONSTRAINT function_graph_executions_pkey PRIMARY KEY (started_at, id);

