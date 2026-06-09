-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/table


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  ADD COLUMN id uuid;

