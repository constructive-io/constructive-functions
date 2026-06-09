-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/updated_at/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN updated_at RESTRICT;


