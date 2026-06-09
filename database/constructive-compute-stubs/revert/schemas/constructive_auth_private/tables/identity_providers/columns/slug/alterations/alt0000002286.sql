-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/slug/alterations/alt0000002286


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN slug DROP NOT NULL;


