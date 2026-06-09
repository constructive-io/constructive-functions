-- Deploy: schemas/constructive_memberships_public/tables/app_admin_grants/columns/updated_at/alterations/alt0000000252
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_admin_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_admin_grants/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".app_admin_grants 
  ALTER COLUMN updated_at SET DEFAULT now();

