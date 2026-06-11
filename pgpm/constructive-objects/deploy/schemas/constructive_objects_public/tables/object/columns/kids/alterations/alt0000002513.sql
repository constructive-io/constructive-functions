-- Deploy: schemas/constructive_objects_public/tables/object/columns/kids/alterations/alt0000002513
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/object/table
-- requires: schemas/constructive_objects_public/tables/object/columns/kids/column
-- requires: schemas/constructive_objects_public/tables/object/columns/ktree/column


ALTER TABLE "constructive_objects_public".object 
  ADD CONSTRAINT objects_kids_ktree_chk 
    CHECK (cardinality(kids) = cardinality(ktree) OR (kids IS NULL AND ktree IS NULL));

