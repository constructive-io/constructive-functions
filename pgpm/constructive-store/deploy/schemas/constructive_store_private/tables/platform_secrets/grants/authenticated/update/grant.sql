-- Deploy: schemas/constructive_store_private/tables/platform_secrets/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table


GRANT UPDATE ON "constructive_store_private".platform_secrets TO authenticated;

