-- Deploy: schemas/constructive_memberships_public/tables/org_members/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_members/table


ALTER TABLE "constructive_memberships_public".org_members 
  ADD COLUMN id uuid;

