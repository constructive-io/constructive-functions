-- Deploy: schemas/constructive_objects_public/tables/object/alterations/alt0000002503
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/object/table


COMMENT ON TABLE "constructive_objects_public".object IS E'Content-addressed Merkle tree objects keyed by UUID v5 hash of data + children';

