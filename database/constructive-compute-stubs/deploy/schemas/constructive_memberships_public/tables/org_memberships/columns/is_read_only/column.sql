-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/is_read_only/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table


ALTER TABLE "constructive_memberships_public".org_memberships 
  ADD COLUMN is_read_only boolean;

