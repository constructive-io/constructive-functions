-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/alterations/alt0000002568
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/table


COMMENT ON TABLE "constructive_platform_function_graph_public".platform_function_graph_store IS E'Named stores — one per version-controlled tree (e.g. one graph, one definition set)';

