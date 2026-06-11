-- Deploy: schemas/constructive_store_private/tables/org_secrets/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table


GRANT DELETE ON "constructive_store_private".org_secrets TO authenticated;

