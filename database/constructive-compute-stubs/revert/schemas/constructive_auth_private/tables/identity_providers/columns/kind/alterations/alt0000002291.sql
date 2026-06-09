-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/kind/alterations/alt0000002291


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN kind DROP NOT NULL;


