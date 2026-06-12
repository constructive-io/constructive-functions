-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/columns/id/alterations/alt0000002572
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/columns/id/column


COMMENT ON COLUMN "constructive_platform_function_graph_public".platform_function_graph_object.id IS E'Content-addressed UUID v5 — deterministic hash of (data, kids, ktree)';

