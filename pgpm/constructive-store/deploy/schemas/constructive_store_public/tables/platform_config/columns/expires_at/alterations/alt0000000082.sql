-- Deploy: schemas/constructive_store_public/tables/platform_config/columns/expires_at/alterations/alt0000000082
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/columns/expires_at/column


COMMENT ON COLUMN "constructive_store_public".platform_config.expires_at IS E'Optional expiration timestamp for time-limited config entries';

