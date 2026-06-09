-- Deploy: schemas/constructive_memberships_public/tables/org_members/columns/is_admin/alterations/alt0000000730
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_members/table
-- requires: schemas/constructive_memberships_public/tables/org_members/columns/is_admin/column


ALTER TABLE "constructive_memberships_public".org_members 
  ALTER COLUMN is_admin SET DEFAULT false;

