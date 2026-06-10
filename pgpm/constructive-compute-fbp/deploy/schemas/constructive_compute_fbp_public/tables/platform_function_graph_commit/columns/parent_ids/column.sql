-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/parent_ids/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/table


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_commit 
  ADD COLUMN parent_ids uuid[];

