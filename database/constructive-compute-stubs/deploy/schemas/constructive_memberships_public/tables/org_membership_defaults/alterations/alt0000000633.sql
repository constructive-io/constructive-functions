-- Deploy: schemas/constructive_memberships_public/tables/org_membership_defaults/alterations/alt0000000633
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/org_membership_defaults/table


ALTER TABLE "constructive_memberships_public".org_membership_defaults 
  DISABLE ROW LEVEL SECURITY;

