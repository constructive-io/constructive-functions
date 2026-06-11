-- Deploy: schemas/constructive_store_private/tables/org_secrets/columns/value/alterations/alt0000002034
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/value/column


COMMENT ON COLUMN "constructive_store_private".org_secrets.value IS E'The PGP-encrypted secret value stored as binary';

