-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/date/alterations/alt0000002593
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/table
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/date/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_commit 
  ALTER COLUMN date SET NOT NULL;

