-- Deploy: schemas/constructive_memberships_public/tables/app_admin_grants/columns/is_grant/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_admin_grants/table


ALTER TABLE "constructive_memberships_public".app_admin_grants 
  ADD COLUMN is_grant boolean;

