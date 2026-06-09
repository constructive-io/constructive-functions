-- Deploy: schemas/constructive_memberships_public/tables/app_memberships/columns/id/alterations/alt0000000184
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_memberships/table
-- requires: schemas/constructive_memberships_public/tables/app_memberships/columns/id/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN id SET DEFAULT uuidv7();

