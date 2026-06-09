-- Deploy: schemas/constructive_memberships_public/tables/app_owner_grants/columns/is_grant/alterations/alt0000000258
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_owner_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_owner_grants/columns/is_grant/column


ALTER TABLE "constructive_memberships_public".app_owner_grants 
  ALTER COLUMN is_grant SET DEFAULT true;

