-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/alterations/alt0000002580
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/table


COMMENT ON TABLE "constructive_compute_fbp_public".platform_function_graph_commit IS E'Commit history — each commit snapshots a tree root for a store';

