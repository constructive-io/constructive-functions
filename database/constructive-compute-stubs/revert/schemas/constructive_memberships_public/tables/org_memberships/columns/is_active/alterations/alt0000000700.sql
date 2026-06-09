-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/is_active/alterations/alt0000000700


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_active DROP NOT NULL;


