-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/columns/title/alterations/alt0000000778
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/title/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ALTER COLUMN title SET DEFAULT '';

