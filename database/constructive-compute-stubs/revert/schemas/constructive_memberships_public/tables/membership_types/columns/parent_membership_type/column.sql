-- Revert: schemas/constructive_memberships_public/tables/membership_types/columns/parent_membership_type/column


ALTER TABLE "constructive_memberships_public".membership_types 
  DROP COLUMN parent_membership_type RESTRICT;


