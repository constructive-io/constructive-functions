-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/columns/actor_id/alterations/alt0000000772
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/actor_id/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ALTER COLUMN actor_id SET NOT NULL;

