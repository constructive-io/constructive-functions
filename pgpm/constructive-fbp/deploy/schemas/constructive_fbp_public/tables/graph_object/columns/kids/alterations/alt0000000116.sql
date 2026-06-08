-- Deploy: schemas/constructive_fbp_public/tables/graph_object/columns/kids/alterations/alt0000000116
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_object/table
-- requires: schemas/constructive_fbp_public/tables/graph_object/columns/kids/column
-- requires: schemas/constructive_fbp_public/tables/graph_object/columns/ktree/column


ALTER TABLE "constructive_fbp_public".graph_object 
  ADD CONSTRAINT graph_objects_kids_ktree_chk 
    CHECK (cardinality(kids) = cardinality(ktree) OR (kids IS NULL AND ktree IS NULL));

