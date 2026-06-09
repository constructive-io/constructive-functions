-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_grants/alterations/alt0000000286
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/table


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  DISABLE ROW LEVEL SECURITY;

