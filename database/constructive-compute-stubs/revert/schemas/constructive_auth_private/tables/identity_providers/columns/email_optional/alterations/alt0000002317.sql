-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/email_optional/alterations/alt0000002317


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN email_optional DROP NOT NULL;


