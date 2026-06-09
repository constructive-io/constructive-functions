-- Deploy: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/is_verified/alterations/alt0000000210
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_membership_defaults/table
-- requires: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/is_verified/column


ALTER TABLE "constructive_memberships_public".app_membership_defaults 
  ALTER COLUMN is_verified SET DEFAULT false;

