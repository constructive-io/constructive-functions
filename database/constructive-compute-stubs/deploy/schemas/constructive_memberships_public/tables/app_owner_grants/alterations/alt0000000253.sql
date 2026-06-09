-- Deploy: schemas/constructive_memberships_public/tables/app_owner_grants/alterations/alt0000000253
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_owner_grants/table


ALTER TABLE "constructive_memberships_public".app_owner_grants 
  DISABLE ROW LEVEL SECURITY;

