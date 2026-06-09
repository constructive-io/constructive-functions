-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/is_built_in/alterations/alt0000002288


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN is_built_in DROP NOT NULL;


