-- Revert: schemas/constructive_memberships_public/tables/app_grants/columns/id/column


ALTER TABLE "constructive_memberships_public".app_grants 
  DROP COLUMN id RESTRICT;


