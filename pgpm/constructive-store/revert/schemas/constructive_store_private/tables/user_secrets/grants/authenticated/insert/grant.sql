-- Revert: schemas/constructive_store_private/tables/user_secrets/grants/authenticated/insert/grant


REVOKE INSERT ON "constructive_store_private".user_secrets FROM authenticated;


