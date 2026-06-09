-- Revert: schemas/constructive_memberships_public/tables/org_admin_grants/columns/updated_at/alterations/alt0000000748


ALTER TABLE "constructive_memberships_public".org_admin_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


