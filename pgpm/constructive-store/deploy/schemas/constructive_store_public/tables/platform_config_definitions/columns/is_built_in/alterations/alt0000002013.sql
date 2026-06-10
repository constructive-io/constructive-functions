-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/columns/is_built_in/alterations/alt0000002013
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/columns/is_built_in/column


COMMENT ON COLUMN "constructive_store_public".platform_config_definitions.is_built_in IS E'Whether this row was seeded as a built-in config definition';

