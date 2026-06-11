-- Deploy: schemas/constructive_store_private/tables/platform_secrets/alterations/alt0000001956
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table


COMMENT ON TABLE "constructive_store_private".platform_secrets IS E'platform-level PGP-encrypted key-value secrets store';

