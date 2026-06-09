-- Revert: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/is_verified/alterations/alt0000000210


ALTER TABLE "constructive_memberships_public".app_membership_defaults 
  ALTER COLUMN is_verified DROP DEFAULT;


