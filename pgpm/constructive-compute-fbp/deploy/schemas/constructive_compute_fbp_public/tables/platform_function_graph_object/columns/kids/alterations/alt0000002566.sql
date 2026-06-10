-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/kids/alterations/alt0000002566
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/table
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/kids/column
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/ktree/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_object 
  ADD CONSTRAINT platform_function_graph_objects_kids_ktree_chk 
    CHECK (cardinality(kids) = cardinality(ktree) OR (kids IS NULL AND ktree IS NULL));

