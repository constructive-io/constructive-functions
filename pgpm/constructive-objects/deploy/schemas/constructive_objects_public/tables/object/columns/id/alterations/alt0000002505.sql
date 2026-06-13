-- Deploy: schemas/constructive_objects_public/tables/object/columns/id/alterations/alt0000002505
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/object/columns/id/column


COMMENT ON COLUMN "constructive_objects_public".object.id IS E'Content-addressed UUID v5 — deterministic hash of (data, kids, ktree)';

