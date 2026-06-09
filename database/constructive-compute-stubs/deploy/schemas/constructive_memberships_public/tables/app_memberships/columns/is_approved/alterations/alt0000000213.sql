-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/is_approved/alterations/alt0000000213
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/is_approved/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN is_approved SET NOT NULL;

