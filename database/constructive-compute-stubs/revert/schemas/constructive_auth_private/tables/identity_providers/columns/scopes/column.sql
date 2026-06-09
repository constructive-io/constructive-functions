-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/scopes/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN scopes RESTRICT;


