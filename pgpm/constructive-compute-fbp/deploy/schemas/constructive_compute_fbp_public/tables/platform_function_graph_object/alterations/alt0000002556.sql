-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/alterations/alt0000002556
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/table


COMMENT ON TABLE "constructive_compute_fbp_public".platform_function_graph_object IS E'Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children';

