-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/enabled/alterations/alt0000002296


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN enabled DROP DEFAULT;


