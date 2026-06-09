-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/allow_external_members/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  DROP COLUMN allow_external_members RESTRICT;


