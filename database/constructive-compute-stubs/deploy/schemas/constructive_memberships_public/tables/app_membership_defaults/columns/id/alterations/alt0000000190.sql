-- Deploy: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/id/alterations/alt0000000190
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_membership_defaults/table
-- requires: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/id/column


ALTER TABLE "constructive_memberships_public".app_membership_defaults 
  ALTER COLUMN id SET DEFAULT uuidv7();

