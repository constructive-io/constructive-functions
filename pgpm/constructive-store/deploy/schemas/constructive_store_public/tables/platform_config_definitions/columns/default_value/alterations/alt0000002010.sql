-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/columns/default_value/alterations/alt0000002010
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/columns/default_value/column


COMMENT ON COLUMN "constructive_store_public".platform_config_definitions.default_value IS 'Default value used when no config entry exists for a namespace';

