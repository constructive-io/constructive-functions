-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/name/alterations/alt0000002602
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/name/column


COMMENT ON COLUMN "constructive_compute_fbp_public".platform_function_graph_ref.name IS E'Ref name (e.g. HEAD, main)';

