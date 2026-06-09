-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/scopes/alterations/alt0000002309


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN scopes DROP DEFAULT;


