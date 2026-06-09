-- Deploy: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/created_at/alterations/alt0000000296
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/created_at/column


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  ALTER COLUMN created_at SET DEFAULT now();

