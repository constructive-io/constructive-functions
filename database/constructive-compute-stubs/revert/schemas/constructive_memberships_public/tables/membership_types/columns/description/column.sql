-- Revert: schemas/constructive_memberships_public/tables/membership_types/columns/description/column


ALTER TABLE "constructive_memberships_public".membership_types 
  DROP COLUMN description RESTRICT;


