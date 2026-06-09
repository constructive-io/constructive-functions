-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/id/alterations/alt0000000630
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/id/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN id SET DEFAULT uuidv7();

