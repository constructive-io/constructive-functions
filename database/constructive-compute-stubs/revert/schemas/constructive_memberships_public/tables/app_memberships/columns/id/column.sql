-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/id/column


ALTER TABLE "constructive_memberships_public".app_memberships 
  DROP COLUMN id RESTRICT;


