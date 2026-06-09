-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/created_at/alterations/alt0000000185
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/created_at/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN created_at SET DEFAULT now();

