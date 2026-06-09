-- Revert: schemas/constructive_auth_private/tables/identity_providers/columns/allow_link_by_email/alterations/alt0000002321


ALTER TABLE "constructive_auth_private".identity_providers 
  ALTER COLUMN allow_link_by_email DROP DEFAULT;


