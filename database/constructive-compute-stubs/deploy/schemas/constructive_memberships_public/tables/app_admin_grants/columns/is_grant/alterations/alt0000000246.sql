-- Deploy: schemas/constructive_memberships_public/tables/app_admin_grants/columns/is_grant/alterations/alt0000000246
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_admin_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_admin_grants/columns/is_grant/column


ALTER TABLE "constructive_memberships_public".app_admin_grants 
  ALTER COLUMN is_grant SET NOT NULL;

