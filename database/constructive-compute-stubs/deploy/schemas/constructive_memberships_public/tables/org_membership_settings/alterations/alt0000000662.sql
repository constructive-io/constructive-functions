-- Deploy: schemas/constructive_memberships_public/tables/org_membership_settings/alterations/alt0000000662
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_settings/table


ALTER TABLE "constructive_memberships_public".org_membership_settings 
  DISABLE ROW LEVEL SECURITY;

