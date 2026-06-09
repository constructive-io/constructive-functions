-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/permissions/alterations/alt0000000235
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/permissions/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN permissions SET DEFAULT (lpad('', 64, '0'))::bit(64);

