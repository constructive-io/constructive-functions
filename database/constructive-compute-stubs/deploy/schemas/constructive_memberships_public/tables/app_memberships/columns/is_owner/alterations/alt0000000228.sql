-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/is_owner/alterations/alt0000000228
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/is_owner/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN is_owner SET NOT NULL;

