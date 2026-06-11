-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/constraints/platform_function_graph_executions_graph_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/graph_id/column
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/id/column
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/constraints/platform_function_graphs_pkey/constraint


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ADD CONSTRAINT platform_function_graph_executions_graph_id_fkey 
    FOREIGN KEY(graph_id) 
    REFERENCES "constructive_compute_public".platform_function_graphs (id);

