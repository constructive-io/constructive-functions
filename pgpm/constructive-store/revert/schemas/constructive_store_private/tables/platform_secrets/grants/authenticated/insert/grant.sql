-- Revert: schemas/constructive_store_private/tables/platform_secrets/grants/authenticated/insert/grant


REVOKE INSERT ON "constructive_store_private".platform_secrets FROM authenticated;


