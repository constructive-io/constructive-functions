-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/columns/ktree/alterations/alt0000002576
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/columns/ktree/column


COMMENT ON COLUMN "constructive_platform_function_graph_public".platform_function_graph_object.ktree IS E'Ordered array of child path names (parallel to kids)';

