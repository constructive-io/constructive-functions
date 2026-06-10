-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/is_built_in/alterations/alt0000002074
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/is_built_in/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.is_built_in IS E'Whether this function is a built-in platform function (synced from platform) vs user-created';

