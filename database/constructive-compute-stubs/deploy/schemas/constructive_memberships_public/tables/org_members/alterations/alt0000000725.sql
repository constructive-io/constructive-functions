-- Deploy: schemas/constructive_memberships_public/tables/org_members/alterations/alt0000000725
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_members/table


ALTER TABLE "constructive_memberships_public".org_members 
  DISABLE ROW LEVEL SECURITY;

