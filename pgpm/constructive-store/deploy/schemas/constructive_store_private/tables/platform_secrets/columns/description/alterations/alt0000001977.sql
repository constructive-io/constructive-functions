-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/description/alterations/alt0000001977
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/description/column


COMMENT ON COLUMN "constructive_store_private".platform_secrets.description IS E'Human-readable note about this secret';

