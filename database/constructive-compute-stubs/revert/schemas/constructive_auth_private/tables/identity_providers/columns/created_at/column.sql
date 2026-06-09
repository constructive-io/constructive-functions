-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/created_at/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN created_at RESTRICT;


