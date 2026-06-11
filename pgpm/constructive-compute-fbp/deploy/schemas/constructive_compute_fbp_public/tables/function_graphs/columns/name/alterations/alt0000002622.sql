-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/name/alterations/alt0000002622
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/name/column


COMMENT ON COLUMN "constructive_compute_fbp_public".function_graphs.name IS E'Graph name (unique per database)';

