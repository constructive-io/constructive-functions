-- Deploy: schemas/constructive_memberships_public/tables/org_members/columns/actor_id/alterations/alt0000000732
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_members/table
-- requires: schemas/constructive_memberships_public/tables/org_members/columns/actor_id/column


ALTER TABLE "constructive_memberships_public".org_members 
  ALTER COLUMN actor_id SET NOT NULL;

