-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/alterations/alt0000000762
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  DISABLE ROW LEVEL SECURITY;

