-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/name/alterations/alt0000002636
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/name/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graphs.name IS E'Graph name (unique per database)';

