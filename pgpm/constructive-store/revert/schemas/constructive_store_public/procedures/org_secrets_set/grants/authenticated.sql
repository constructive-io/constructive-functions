-- Revert: schemas/constructive_store_public/procedures/org_secrets_set/grants/authenticated


REVOKE EXECUTE ON FUNCTION "constructive_store_public".org_secrets_set FROM authenticated;


