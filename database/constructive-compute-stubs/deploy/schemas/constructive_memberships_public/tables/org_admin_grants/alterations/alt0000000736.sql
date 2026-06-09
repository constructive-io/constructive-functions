-- Deploy: schemas/constructive_memberships_public/tables/org_admin_grants/alterations/alt0000000736
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_admin_grants/table


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  DISABLE ROW LEVEL SECURITY;

