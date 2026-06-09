-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/email_optional/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN email_optional RESTRICT;


