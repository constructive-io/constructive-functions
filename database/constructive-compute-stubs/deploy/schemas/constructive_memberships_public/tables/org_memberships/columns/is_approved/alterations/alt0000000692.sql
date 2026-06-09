-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/is_approved/alterations/alt0000000692
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/is_approved/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_approved SET DEFAULT false;

