-- Revert: schemas/constructive_memberships_public/tables/org_permission_default_grants/columns/created_at/alterations/alt0000000821


ALTER TABLE "constructive_memberships_public".org_permission_default_grants 
  ALTER COLUMN created_at DROP DEFAULT;


