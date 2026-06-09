-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/pkce_enabled/alterations/alt0000002327


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN pkce_enabled DROP DEFAULT;


