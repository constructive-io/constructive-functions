-- Revert: schemas/constructive_memberships_public/tables/app_owner_grants/columns/id/alterations/alt0000000255


ALTER TABLE "constructive_memberships_public".app_owner_grants 
  ALTER COLUMN id DROP NOT NULL;


