-- Revert: schemas/constructive_memberships_public/tables/app_membership_defaults/columns/created_at/column


ALTER TABLE "constructive_memberships_public".app_membership_defaults 
  DROP COLUMN created_at RESTRICT;


