-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/columns/membership_id/alterations/alt0000000769
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/membership_id/column


COMMENT ON COLUMN "constructive_memberships_public".org_member_profiles.membership_id IS E'References the membership this profile belongs to (1:1)';

