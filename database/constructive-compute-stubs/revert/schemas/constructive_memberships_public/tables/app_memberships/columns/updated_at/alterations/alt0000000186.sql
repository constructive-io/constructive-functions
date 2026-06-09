-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/updated_at/alterations/alt0000000186


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN updated_at DROP DEFAULT;


