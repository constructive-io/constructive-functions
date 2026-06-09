-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/invite_profile_assignment_mode/alterations/alt0000000686


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN invite_profile_assignment_mode DROP DEFAULT;


