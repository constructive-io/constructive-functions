-- Revert: schemas/constructive_store_public/procedures/platform_secrets_set/grants/authenticated


REVOKE EXECUTE ON FUNCTION "constructive_store_public".platform_secrets_set FROM authenticated;


