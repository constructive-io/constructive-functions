-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/validation_errors/alterations/alt0000002670
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/validation_errors/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graphs.validation_errors IS E'Array of validation error objects when is_valid = false';

