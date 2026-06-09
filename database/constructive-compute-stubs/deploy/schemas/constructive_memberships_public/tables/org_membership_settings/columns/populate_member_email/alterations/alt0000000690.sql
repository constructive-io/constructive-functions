-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/columns/populate_member_email/alterations/alt0000000690
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/columns/populate_member_email/column


COMMENT ON COLUMN "constructive_memberships_public".org_membership_settings.populate_member_email IS E'Whether member_profiles.email is snapshot on join and kept synced with the user''s primary email. When FALSE, the email field is left blank and never synced from the user''s primary email.';

