-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/is_built_in/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN is_built_in RESTRICT;


