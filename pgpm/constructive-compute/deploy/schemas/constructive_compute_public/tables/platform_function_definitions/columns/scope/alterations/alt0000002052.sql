-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/scope/alterations/alt0000002052
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/scope/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.scope IS E'Function grouping scope (e.g. email, embed, chunk, custom)';

