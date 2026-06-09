-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/granted/alterations/alt0000000715


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN granted DROP NOT NULL;


