-- Deploy: schemas/constructive_memberships_public/tables/org_admin_grants/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/table


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  ADD COLUMN updated_at timestamptz;

