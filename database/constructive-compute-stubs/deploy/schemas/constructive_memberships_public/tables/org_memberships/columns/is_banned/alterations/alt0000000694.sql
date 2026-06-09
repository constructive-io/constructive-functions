-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/is_banned/alterations/alt0000000694
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/is_banned/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_banned SET NOT NULL;

