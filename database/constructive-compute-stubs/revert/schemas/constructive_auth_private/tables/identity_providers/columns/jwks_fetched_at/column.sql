-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/jwks_fetched_at/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN jwks_fetched_at RESTRICT;


