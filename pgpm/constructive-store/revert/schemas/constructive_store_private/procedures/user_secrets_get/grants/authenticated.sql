-- Revert: schemas/constructive_store_private/procedures/user_secrets_get/grants/authenticated


REVOKE EXECUTE ON FUNCTION "constructive_store_private".user_secrets_get FROM authenticated;


