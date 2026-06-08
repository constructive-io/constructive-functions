-- Deploy: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/constraints/function_graph_execution_outputs_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/table
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/created_at/column
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/id/column


ALTER TABLE "constructive_fbp_private".function_graph_execution_outputs 
  ADD CONSTRAINT function_graph_execution_outputs_pkey PRIMARY KEY (created_at, id);

