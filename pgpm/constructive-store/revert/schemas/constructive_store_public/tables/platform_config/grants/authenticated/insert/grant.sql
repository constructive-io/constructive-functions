-- Revert: schemas/constructive_store_public/tables/platform_config/grants/authenticated/insert/grant


REVOKE INSERT ON "constructive_store_public".platform_config FROM authenticated;


