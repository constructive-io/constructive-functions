-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/skip_nonce_check/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN skip_nonce_check RESTRICT;


