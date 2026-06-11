-- Deploy: schemas/constructive_objects_public/tables/object/columns/ktree/alterations/alt0000002509
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/object/columns/ktree/column


COMMENT ON COLUMN "constructive_objects_public".object.ktree IS E'Ordered array of child path names (parallel to kids)';

