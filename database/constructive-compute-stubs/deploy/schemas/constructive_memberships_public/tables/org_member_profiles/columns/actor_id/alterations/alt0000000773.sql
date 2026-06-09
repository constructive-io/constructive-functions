-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/columns/actor_id/alterations/alt0000000773
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/actor_id/column


COMMENT ON COLUMN "constructive_memberships_public".org_member_profiles.actor_id IS E'References the user who owns this profile (for self-edit RLS)';

