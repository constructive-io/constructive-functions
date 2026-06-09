-- Revert: schemas/constructive_memberships_public/tables/membership_types/columns/description/alterations/alt0000000020


ALTER TABLE "constructive_memberships_public".membership_types 
  ALTER COLUMN description DROP NOT NULL;


