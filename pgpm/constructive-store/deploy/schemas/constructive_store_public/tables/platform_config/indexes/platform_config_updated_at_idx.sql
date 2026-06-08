-- Deploy: schemas/constructive_store_public/tables/platform_config/indexes/platform_config_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_store_public/tables/platform_config/columns/updated_at/column


CREATE INDEX platform_config_updated_at_idx ON "constructive_store_public".platform_config ( updated_at );

