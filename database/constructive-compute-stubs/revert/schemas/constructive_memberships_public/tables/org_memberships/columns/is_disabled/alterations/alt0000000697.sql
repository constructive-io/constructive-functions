-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/is_disabled/alterations/alt0000000697


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_disabled DROP NOT NULL;


