-- Deploy: schemas/constructive_memberships_public/tables/app_owner_grants/columns/id/alterations/alt0000000256
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_owner_grants/table
-- requires: schemas/constructive_memberships_public/tables/app_owner_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".app_owner_grants 
  ALTER COLUMN id SET DEFAULT uuidv7();

