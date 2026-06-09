-- Deploy: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/created_by/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_membership_defaults/table


ALTER TABLE "constructive_memberships_public".app_membership_defaults 
  ADD COLUMN created_by uuid;

