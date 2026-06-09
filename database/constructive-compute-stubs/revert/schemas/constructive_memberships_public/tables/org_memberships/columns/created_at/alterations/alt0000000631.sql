-- Revert: schemas/constructive_memberships_public/tables/org_memberships/columns/created_at/alterations/alt0000000631


ALTER TABLE "constructive_memberships_public".org_memberships 
  ALTER COLUMN created_at DROP DEFAULT;


