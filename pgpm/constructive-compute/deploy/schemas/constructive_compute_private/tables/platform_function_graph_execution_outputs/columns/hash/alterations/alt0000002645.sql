-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/columns/hash/alterations/alt0000002645
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/columns/hash/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_execution_outputs.hash IS E'SHA-256 hash of the data JSONB — content-addressed deduplication';

