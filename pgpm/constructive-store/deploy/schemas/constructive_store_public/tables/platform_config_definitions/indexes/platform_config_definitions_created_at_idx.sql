-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/indexes/platform_config_definitions_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/table
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/columns/created_at/column


CREATE INDEX platform_config_definitions_created_at_idx ON "constructive_store_public".platform_config_definitions ( created_at );

