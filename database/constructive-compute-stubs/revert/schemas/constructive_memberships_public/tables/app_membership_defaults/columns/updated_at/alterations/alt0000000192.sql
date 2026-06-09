-- Revert: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/updated_at/alterations/alt0000000192


ALTER TABLE "constructive_memberships_public".app_membership_defaults 
  ALTER COLUMN updated_at DROP DEFAULT;


