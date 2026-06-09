-- Revert: schemas/constructive_memberships_public/tables/org_membership_settings/columns/invite_profile_assignment_mode/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  DROP COLUMN invite_profile_assignment_mode RESTRICT;


