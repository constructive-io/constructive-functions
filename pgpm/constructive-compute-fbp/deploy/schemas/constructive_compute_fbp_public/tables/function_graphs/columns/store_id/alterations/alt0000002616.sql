-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/store_id/alterations/alt0000002616
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/store_id/column


COMMENT ON COLUMN "constructive_compute_fbp_public".function_graphs.store_id IS E'Graph store (Merkle store) holding the graph definition';

