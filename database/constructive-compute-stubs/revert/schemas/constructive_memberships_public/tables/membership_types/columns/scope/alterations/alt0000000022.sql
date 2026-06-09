-- Revert: schemas/constructive_memberships_public/tables/membership_types/columns/scope/alterations/alt0000000022


ALTER TABLE "constructive_memberships_public".membership_types 
  ALTER COLUMN scope DROP NOT NULL;


