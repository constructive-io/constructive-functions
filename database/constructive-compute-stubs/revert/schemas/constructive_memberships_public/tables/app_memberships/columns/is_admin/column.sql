-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/is_admin/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  DROP COLUMN is_admin RESTRICT;


