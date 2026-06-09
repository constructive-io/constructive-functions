-- Deploy: schemas/constructive_memberships_public/tables/org_member_profiles/columns/email/alterations/alt0000000776
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/table
-- requires: schemas/constructive_memberships_public/tables/org_member_profiles/columns/email/column


ALTER TABLE "constructive_memberships_public".org_member_profiles 
  ALTER COLUMN email SET DEFAULT '';

