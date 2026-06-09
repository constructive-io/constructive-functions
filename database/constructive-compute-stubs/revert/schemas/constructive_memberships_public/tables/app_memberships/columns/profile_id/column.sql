-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/profile_id/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  DROP COLUMN profile_id RESTRICT;


