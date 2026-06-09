-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/is_read_only/alterations/alt0000000722
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table
-- requires: schemas/constructive_memberships_public/tables/org_memberships/columns/is_read_only/column


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_read_only SET NOT NULL;

