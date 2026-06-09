-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/columns/updated_at/alterations/alt0000000767
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ALTER COLUMN updated_at SET DEFAULT now();

