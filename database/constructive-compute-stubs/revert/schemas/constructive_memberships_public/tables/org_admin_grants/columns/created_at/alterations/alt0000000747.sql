-- Revert: schemas/constructive_memberships_public/tables/org_admin_grants/columns/created_at/alterations/alt0000000747


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  ALTER COLUMN created_at DROP DEFAULT;


