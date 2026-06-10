-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/columns/hash/alterations/alt0000002644
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/columns/hash/column


COMMENT ON COLUMN "constructive_compute_fbp_private".function_graph_execution_outputs.hash IS E'SHA-256 hash of the data JSONB — content-addressed deduplication';

