-- Deploy: schemas/constructive_memberships_public/tables/org_grants/columns/id/alterations/alt0000000786
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_grants/table
-- requires: schemas/constructive_memberships_public/tables/org_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".org_grants 
  ALTER COLUMN id SET DEFAULT uuidv7();

