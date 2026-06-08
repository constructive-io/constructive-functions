-- Deploy: schemas/constructive_fbp_public/tables/graph_object/alterations/alt0000000107
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_object/table


COMMENT ON TABLE "constructive_fbp_public".graph_object IS E'Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children';

