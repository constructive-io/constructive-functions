-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/is_invocable/alterations/alt0000002061
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/is_invocable/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.is_invocable IS E'Whether this function can be called via function_invocations (public API). Default false = internal-only via add_job()';

