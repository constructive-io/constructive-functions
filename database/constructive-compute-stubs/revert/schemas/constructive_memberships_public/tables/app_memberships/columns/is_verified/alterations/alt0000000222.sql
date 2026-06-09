-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/is_verified/alterations/alt0000000222


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN is_verified DROP NOT NULL;


