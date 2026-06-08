-- Deploy: schemas/constructive_store_private/tables/org_secrets/columns/key_id/alterations/alt0000000015
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/key_id/column


COMMENT ON COLUMN "constructive_store_private".org_secrets.key_id IS E'Per-secret key used as PGP symmetric encryption passphrase';

