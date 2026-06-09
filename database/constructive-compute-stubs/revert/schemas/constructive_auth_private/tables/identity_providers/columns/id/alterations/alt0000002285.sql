-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/id/alterations/alt0000002285


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN id DROP DEFAULT;


