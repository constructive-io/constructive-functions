-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/is_invocable/alterations/alt0000000012
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/is_invocable/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_definitions.is_invocable IS E'Whether this function can be called via function_invocations (public API). Default false = internal-only via add_job()';

