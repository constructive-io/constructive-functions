-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/is_banned/alterations/alt0000000217
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/is_banned/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN is_banned SET DEFAULT false;

