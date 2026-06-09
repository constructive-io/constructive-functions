-- Revert: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/created_at/alterations/alt0000000191


ALTER TABLE "constructive_memberships_public".app_membership_defaults 
  ALTER COLUMN created_at DROP DEFAULT;


