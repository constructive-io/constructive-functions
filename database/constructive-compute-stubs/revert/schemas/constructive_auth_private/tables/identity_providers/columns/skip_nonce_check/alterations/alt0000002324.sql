-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/skip_nonce_check/alterations/alt0000002324


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN skip_nonce_check DROP DEFAULT;


