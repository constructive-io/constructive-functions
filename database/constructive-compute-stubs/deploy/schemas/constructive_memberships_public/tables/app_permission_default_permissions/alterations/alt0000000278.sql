-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_permissions/alterations/alt0000000278
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_permissions/table


ALTER TABLE "constructive_memberships_public".app_permission_default_permissions 
  DISABLE ROW LEVEL SECURITY;

