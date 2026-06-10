-- Deploy: schemas/constructive_store_private/tables/user_secrets/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table


GRANT UPDATE ON "constructive_store_private".user_secrets TO authenticated;

