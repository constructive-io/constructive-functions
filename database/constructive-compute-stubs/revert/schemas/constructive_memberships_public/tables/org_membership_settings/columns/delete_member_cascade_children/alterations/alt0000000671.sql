-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/delete_member_cascade_children/alterations/alt0000000671


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN delete_member_cascade_children DROP DEFAULT;


