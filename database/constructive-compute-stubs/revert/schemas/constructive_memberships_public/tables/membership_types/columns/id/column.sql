-- Revert: schemas/constructive_memberships_public/tables/membership_types/columns/id/column


ALTER TABLE "constructive_memberships_public".membership_types 
  DROP COLUMN id RESTRICT;


