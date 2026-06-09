-- Deploy: schemas/constructive_memberships_public/tables/app_grants/alterations/alt0000000264
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_grants/table


ALTER TABLE "constructive_memberships_public".app_grants 
  DISABLE ROW LEVEL SECURITY;

