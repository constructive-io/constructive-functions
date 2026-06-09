-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/allow_external_members/alterations/alt0000000683


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN allow_external_members DROP DEFAULT;


