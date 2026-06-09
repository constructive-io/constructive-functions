-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/pkce_enabled/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN pkce_enabled RESTRICT;


