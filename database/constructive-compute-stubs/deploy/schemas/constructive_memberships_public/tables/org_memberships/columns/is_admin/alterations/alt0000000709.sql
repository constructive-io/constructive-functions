-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/is_admin/alterations/alt0000000709
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/is_admin/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_admin SET NOT NULL;

