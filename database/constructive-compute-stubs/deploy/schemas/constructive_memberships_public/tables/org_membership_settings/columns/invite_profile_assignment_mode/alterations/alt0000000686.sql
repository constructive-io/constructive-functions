-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/invite_profile_assignment_mode/alterations/alt0000000686
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/invite_profile_assignment_mode/column


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  ALTER COLUMN invite_profile_assignment_mode SET DEFAULT 'strict';

