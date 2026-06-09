-- Deploy: schemas/constructive_memberships_public/tables/org_members/columns/id/alterations/alt0000000728
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_members/table
-- requires: schemas/constructive_memberships_public/tables/org_members/columns/id/column


ALTER TABLE "constructive_memberships_public".org_members 
  ALTER COLUMN id SET DEFAULT uuidv7();

