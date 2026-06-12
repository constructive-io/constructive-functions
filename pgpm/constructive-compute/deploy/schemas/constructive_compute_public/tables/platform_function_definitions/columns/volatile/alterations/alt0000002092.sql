-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/volatile/alterations/alt0000002092
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/volatile/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_definitions.volatile IS E'Whether this function has side effects (cannot be cached or memoized)';

