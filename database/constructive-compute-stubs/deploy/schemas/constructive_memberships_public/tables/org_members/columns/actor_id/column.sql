-- Deploy: schemas/constructive_memberships_public/tables/org_members/columns/actor_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_members/table


ALTER TABLE "constructive_memberships_public".org_members 
  ADD COLUMN actor_id uuid;

