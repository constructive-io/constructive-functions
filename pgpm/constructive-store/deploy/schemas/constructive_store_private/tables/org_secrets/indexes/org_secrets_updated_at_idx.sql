-- Deploy: schemas/constructive_store_private/tables/org_secrets/indexes/org_secrets_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/updated_at/column


CREATE INDEX org_secrets_updated_at_idx ON "constructive_store_private".org_secrets ( updated_at );

