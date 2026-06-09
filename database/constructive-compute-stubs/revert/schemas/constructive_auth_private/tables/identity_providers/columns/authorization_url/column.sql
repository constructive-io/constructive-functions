-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/authorization_url/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN authorization_url RESTRICT;


