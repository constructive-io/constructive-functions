-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/invite_profile_assignment_mode/alterations/alt0000000687
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/invite_profile_assignment_mode/column


COMMENT ON COLUMN "constructive_memberships_public".org_membership_settings.invite_profile_assignment_mode IS E'Controls how profile assignment on invites is validated: strict (permission + subset check), permission_only (permission only), or subset_only (subset check only)';

