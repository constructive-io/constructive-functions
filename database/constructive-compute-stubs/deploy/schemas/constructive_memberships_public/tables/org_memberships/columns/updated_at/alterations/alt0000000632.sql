-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/updated_at/alterations/alt0000000632
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN updated_at SET DEFAULT now();

