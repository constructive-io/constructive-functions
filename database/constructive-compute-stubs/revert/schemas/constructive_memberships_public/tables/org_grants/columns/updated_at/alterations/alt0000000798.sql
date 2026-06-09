-- Revert: schemas/constructive_memberships_public/tables/org_grants/columns/updated_at/alterations/alt0000000798


ALTER TABLE "constructive_memberships_public".org_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


