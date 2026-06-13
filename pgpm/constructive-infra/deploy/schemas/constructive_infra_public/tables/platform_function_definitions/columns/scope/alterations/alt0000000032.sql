-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/scope/alterations/alt0000000032
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/scope/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_definitions.scope IS E'Function grouping scope (e.g. email, embed, chunk, custom)';

