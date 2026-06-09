-- Deploy: schemas/constructive_memberships_public/tables/org_memberships/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_memberships/table


ALTER TABLE "constructive_memberships_public".org_memberships 
  ADD COLUMN created_at timestamptz;

