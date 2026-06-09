-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/is_banned/alterations/alt0000000694


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_banned DROP NOT NULL;


