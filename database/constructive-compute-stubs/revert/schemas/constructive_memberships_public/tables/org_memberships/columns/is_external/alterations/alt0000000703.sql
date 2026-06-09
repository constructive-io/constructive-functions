-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/is_external/alterations/alt0000000703


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN is_external DROP NOT NULL;


