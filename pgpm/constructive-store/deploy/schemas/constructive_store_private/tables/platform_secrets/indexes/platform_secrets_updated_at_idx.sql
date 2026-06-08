-- Deploy: schemas/constructive_store_private/tables/platform_secrets/indexes/platform_secrets_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/updated_at/column


CREATE INDEX platform_secrets_updated_at_idx ON "constructive_store_private".platform_secrets ( updated_at );

