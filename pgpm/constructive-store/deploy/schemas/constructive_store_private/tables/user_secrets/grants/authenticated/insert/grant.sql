-- Deploy: schemas/constructive_store_private/tables/user_secrets/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table


GRANT INSERT ON "constructive_store_private".user_secrets TO authenticated;

