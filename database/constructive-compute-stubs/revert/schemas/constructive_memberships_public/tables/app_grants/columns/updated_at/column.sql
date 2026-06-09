-- Revert: schemas/constructive_memberships_public/tables/app_grants/columns/updated_at/column


ALTER TABLE "constructive_memberships_public".app_grants 
  DROP COLUMN updated_at RESTRICT;


