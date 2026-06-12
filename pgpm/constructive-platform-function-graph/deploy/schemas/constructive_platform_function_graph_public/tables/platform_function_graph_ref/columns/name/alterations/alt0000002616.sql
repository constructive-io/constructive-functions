-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_ref/columns/name/alterations/alt0000002616
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_ref/columns/name/column


COMMENT ON COLUMN "constructive_platform_function_graph_public".platform_function_graph_ref.name IS E'Ref name (e.g. HEAD, main)';

