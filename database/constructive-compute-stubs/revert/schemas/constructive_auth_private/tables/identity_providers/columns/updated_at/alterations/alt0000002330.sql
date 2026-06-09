-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/updated_at/alterations/alt0000002330


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN updated_at DROP DEFAULT;


