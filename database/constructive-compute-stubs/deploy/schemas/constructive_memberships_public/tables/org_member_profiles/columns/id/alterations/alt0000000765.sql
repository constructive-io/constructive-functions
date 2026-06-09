-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/columns/id/alterations/alt0000000765
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/id/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ALTER COLUMN id SET DEFAULT uuidv7();

