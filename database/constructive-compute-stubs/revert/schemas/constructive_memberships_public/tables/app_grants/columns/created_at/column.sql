-- Revert: schemas/constructive_memberships_public/tables/app_grants/columns/created_at/column


ALTER TABLE "constructive_memberships_public".app_grants 
  DROP COLUMN created_at RESTRICT;


