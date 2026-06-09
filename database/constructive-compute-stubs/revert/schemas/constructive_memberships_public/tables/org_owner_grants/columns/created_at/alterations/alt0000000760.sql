-- Revert: schemas/constructive_memberships_public/tables/org_owner_grants/columns/created_at/alterations/alt0000000760


ALTER TABLE "constructive_memberships_public".org_owner_grants 
  ALTER COLUMN created_at DROP DEFAULT;


