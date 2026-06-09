-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/created_at/alterations/alt0000002329


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN created_at DROP DEFAULT;


