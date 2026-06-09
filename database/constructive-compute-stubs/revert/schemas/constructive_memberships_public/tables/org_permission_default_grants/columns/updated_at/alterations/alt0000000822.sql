-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/updated_at/alterations/alt0000000822


ALTER TABLE "constructive_memberships_public".org_permission_default_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


