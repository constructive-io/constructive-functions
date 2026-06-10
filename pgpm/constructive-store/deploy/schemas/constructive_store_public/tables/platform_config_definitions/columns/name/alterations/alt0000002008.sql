-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/columns/name/alterations/alt0000002008
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/columns/name/column


COMMENT ON COLUMN "constructive_store_public".platform_config_definitions.name IS E'Config key name (must match config table name for resolution)';

