-- Revert: schemas/constructive_memberships_public/tables/membership_types/columns/name/column


ALTER TABLE "constructive_memberships_public".membership_types 
  DROP COLUMN name RESTRICT;


