-- Revert: schemas/constructive_memberships_public/tables/app_permission_default_grants/columns/id/alterations/alt0000000288


ALTER TABLE "constructive_memberships_public".app_permission_default_grants 
  ALTER COLUMN id DROP NOT NULL;


