-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/key_id/alterations/alt0000000042
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/key_id/column


COMMENT ON COLUMN "constructive_store_private".platform_secrets.key_id IS E'Per-secret key used as PGP symmetric encryption passphrase';

