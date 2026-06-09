-- Deploy: schemas/constructive_memberships_public/tables/app_grants/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_grants/table


ALTER TABLE "constructive_memberships_public".app_grants 
  ADD COLUMN created_at timestamptz;

