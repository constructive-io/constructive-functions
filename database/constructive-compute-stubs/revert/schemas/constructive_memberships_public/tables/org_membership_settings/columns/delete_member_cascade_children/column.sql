-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/delete_member_cascade_children/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  DROP COLUMN delete_member_cascade_children RESTRICT;


