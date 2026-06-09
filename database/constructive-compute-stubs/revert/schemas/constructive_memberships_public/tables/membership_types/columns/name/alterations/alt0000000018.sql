-- Revert: schemas/constructive_memberships_public/tables/membership_types/columns/name/alterations/alt0000000018


ALTER TABLE "constructive_memberships_public".membership_types 
  ALTER COLUMN name DROP NOT NULL;


