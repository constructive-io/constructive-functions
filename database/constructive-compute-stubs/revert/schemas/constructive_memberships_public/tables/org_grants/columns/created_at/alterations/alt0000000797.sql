-- Revert: schemas/constructive_memberships_public/tables/org_grants/columns/created_at/alterations/alt0000000797


ALTER TABLE "constructive_memberships_public".org_grants 
  ALTER COLUMN created_at DROP DEFAULT;


