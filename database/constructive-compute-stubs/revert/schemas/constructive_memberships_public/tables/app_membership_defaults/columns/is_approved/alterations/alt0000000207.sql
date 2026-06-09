-- Revert: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/is_approved/alterations/alt0000000207


ALTER TABLE "constructive_memberships_public".app_membership_defaults 
  ALTER COLUMN is_approved DROP DEFAULT;


