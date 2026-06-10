-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/store_id/alterations/alt0000002658
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/store_id/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graphs.store_id IS E'Graph store (Merkle store) holding the graph definition';

