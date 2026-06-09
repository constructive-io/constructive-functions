-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/issuer_url/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN issuer_url RESTRICT;


