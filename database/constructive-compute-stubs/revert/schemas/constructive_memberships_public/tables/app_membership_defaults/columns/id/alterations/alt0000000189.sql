-- Revert: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/id/alterations/alt0000000189


ALTER TABLE "constructive_memberships_public".app_membership_defaults 
  ALTER COLUMN id DROP NOT NULL;


