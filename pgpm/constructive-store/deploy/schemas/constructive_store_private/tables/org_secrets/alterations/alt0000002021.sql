-- Deploy: schemas/constructive_store_private/tables/org_secrets/alterations/alt0000002021
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table


COMMENT ON TABLE "constructive_store_private".org_secrets IS E'org-level PGP-encrypted key-value secrets store';

