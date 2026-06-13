-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/max_attempts/alterations/alt0000002064
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/max_attempts/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.max_attempts IS 'Maximum retry attempts for the underlying job';

