-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/is_owner/alterations/alt0000000707
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/is_owner/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_owner SET DEFAULT false;

