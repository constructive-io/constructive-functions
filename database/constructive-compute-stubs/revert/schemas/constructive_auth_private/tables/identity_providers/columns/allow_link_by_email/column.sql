-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/allow_link_by_email/column


ALTER TABLE "constructive_auth_private".identity_providers 
  DROP COLUMN allow_link_by_email RESTRICT;


