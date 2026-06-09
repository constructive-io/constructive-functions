-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/token_url/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN token_url RESTRICT;


