-- Revert: schemas/constructive_memberships_public/tables/app_admin_grants/columns/created_at/column


ALTER TABLE "constructive_memberships_public".app_admin_grants 
  DROP COLUMN created_at RESTRICT;


