-- Deploy: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/updated_at/alterations/alt0000000192
-- made with <3 @ constructive.io

-- requires: schemas/constructive_memberships_public/schema
-- requires: schemas/constructive_memberships_public/tables/app_membership_defaults/table
-- requires: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".app_membership_defaults 
  ALTER COLUMN updated_at SET DEFAULT now();

