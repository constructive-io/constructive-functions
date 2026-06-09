-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/is_banned/alterations/alt0000000216


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN is_banned DROP NOT NULL;


