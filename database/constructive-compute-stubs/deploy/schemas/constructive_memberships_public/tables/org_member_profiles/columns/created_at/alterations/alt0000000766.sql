-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/columns/created_at/alterations/alt0000000766
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/created_at/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ALTER COLUMN created_at SET DEFAULT now();

