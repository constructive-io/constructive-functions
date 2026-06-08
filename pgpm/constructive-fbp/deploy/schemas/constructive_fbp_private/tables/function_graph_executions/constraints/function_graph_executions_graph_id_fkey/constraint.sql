-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/constraints/function_graph_executions_graph_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/graph_id/column
-- requires: schemas/constructive_fbp_public/tables/function_graphs/columns/id/column
-- requires: schemas/constructive_fbp_public/tables/function_graphs/constraints/function_graphs_pkey/constraint


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ADD CONSTRAINT function_graph_executions_graph_id_fkey 
    FOREIGN KEY(graph_id) 
    REFERENCES "constructive_fbp_public".function_graphs (id);

