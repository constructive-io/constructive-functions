-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/permission_id/alterations/alt0000000290
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/permission_id/column


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  ALTER COLUMN permission_id SET NOT NULL;

