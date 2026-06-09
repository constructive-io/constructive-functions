-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/is_admin/alterations/alt0000000232
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/is_admin/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN is_admin SET DEFAULT false;

