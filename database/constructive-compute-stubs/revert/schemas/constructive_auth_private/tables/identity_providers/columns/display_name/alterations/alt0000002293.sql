-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/display_name/alterations/alt0000002293


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN display_name DROP NOT NULL;


