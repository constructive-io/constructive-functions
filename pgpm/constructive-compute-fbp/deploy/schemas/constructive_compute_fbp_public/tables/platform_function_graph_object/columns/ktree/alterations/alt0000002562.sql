-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/ktree/alterations/alt0000002562
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/ktree/column


COMMENT ON COLUMN "constructive_compute_fbp_public".platform_function_graph_object.ktree IS E'Ordered array of child path names (parallel to kids)';

