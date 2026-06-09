-- Revert: schemas/constructive_memberships_public/tables/app_memberships/columns/is_approved/alterations/alt0000000213


ALTER TABLE "constructive_memberships_public".app_memberships 
  ALTER COLUMN is_approved DROP NOT NULL;


