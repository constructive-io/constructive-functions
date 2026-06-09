-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/columns/bio/alterations/alt0000000780
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/bio/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ALTER COLUMN bio SET DEFAULT '';

