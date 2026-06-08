-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/value/alterations/alt0000000051
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/value/column


COMMENT ON COLUMN "constructive_store_private".platform_secrets.value IS E'The PGP-encrypted secret value stored as binary';

