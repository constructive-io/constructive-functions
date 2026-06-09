-- Revert: schemas/constructive_memberships_public/tables/app_grants/columns/permissions/column


ALTER TABLE "constructive_memberships_public".app_grants 
  DROP COLUMN permissions RESTRICT;


