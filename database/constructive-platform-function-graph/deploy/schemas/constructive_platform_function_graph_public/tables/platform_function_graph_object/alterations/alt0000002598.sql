-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/alterations/alt0000002598
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/table


COMMENT ON TABLE "constructive_platform_function_graph_public".platform_function_graph_object IS E'Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children';

