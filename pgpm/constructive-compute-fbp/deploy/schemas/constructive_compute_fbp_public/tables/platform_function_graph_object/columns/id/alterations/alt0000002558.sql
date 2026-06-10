-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/id/alterations/alt0000002558
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/id/column


COMMENT ON COLUMN "constructive_compute_fbp_public".platform_function_graph_object.id IS E'Content-addressed UUID v5 — deterministic hash of (data, kids, ktree)';

