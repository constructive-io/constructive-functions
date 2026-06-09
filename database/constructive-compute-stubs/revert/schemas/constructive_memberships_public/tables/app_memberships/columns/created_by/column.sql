-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/created_by/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  DROP COLUMN created_by RESTRICT;


