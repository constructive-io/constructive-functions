-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/created_by/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table


ALTER TABLE "constructive_memberships_public".app_memberships 
  ADD COLUMN created_by uuid;

